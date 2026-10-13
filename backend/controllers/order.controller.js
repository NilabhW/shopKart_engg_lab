const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { getRazorpay } = require('../config/razorpay');

const SHIPPING_FIELDS = {
    fullName: 'Full name',
    phone: 'Phone number',
    addressLine1: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode'
};

// Returns { address, error } with every field trimmed.
const validateShippingAddress = (input) => {
    if (!input || typeof input !== 'object') {
        return { error: 'Shipping address is required' };
    }

    const address = {};
    for (const [field, label] of Object.entries(SHIPPING_FIELDS)) {
        const value = typeof input[field] === 'string' ? input[field].trim() : '';
        if (!value) {
            return { error: `${label} is required` };
        }
        address[field] = value;
    }

    if (!/^\d{10}$/.test(address.phone)) {
        return { error: 'Phone number must contain 10 digits' };
    }

    if (!/^\d{6}$/.test(address.pincode)) {
        return { error: 'Pincode must contain 6 digits' };
    }

    return { address };
};

const signaturesMatch = (expected, received) => {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(received), 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// POST /orders/create-payment-order
// Only the shipping address is read from the body. Items, prices and the total
// are rebuilt from the user's cart and the latest Product documents.
const createPaymentOrder = async (req, res) => {
    try {
        const { address, error } = validateShippingAddress(req.body?.shippingAddress);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }

        // Load the latest Product data for every cart item
        const productIds = customer.cart.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = productMap.get(cartItem.product.toString());

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'A product in your cart is no longer available. Please remove it and try again.'
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            totalAmount += product.price * cartItem.quantity;
        }

        totalAmount = Math.round(totalAmount * 100) / 100;

        const razorpay = getRazorpay();
        if (!razorpay) {
            return res.status(500).json({
                success: false,
                message: 'Payment gateway is not configured. Add Razorpay test keys to backend .env'
            });
        }

        const shopKartOrder = await Order.create({
            user: customer._id,
            items,
            shippingAddress: address,
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT'
        });

        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // INR -> paise
                currency: 'INR',
                receipt: shopKartOrder._id.toString()
            });
        } catch (rzpErr) {
            shopKartOrder.paymentStatus = 'FAILED';
            await shopKartOrder.save();

            return res.status(502).json({
                success: false,
                message: rzpErr?.error?.description || 'Unable to create Razorpay order'
            });
        }

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        // Cart is intentionally left untouched until payment is verified.
        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body || {};

        if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment details'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        // Ownership is enforced in the query itself
        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                order
            });
        }

        if (!order.razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: 'No payment was initiated for this order'
            });
        }

        if (razorpay_order_id && razorpay_order_id !== order.razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // The trusted Razorpay order id comes from our database, not the browser
        const body = order.razorpayOrderId + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (!signaturesMatch(expectedSignature, razorpay_signature)) {
            // Order stays PENDING and the cart is preserved
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        order.paymentStatus = 'PAID';
        order.status = 'PLACED';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Reduce stock for purchased items (guarded so stock never goes negative)
        await Product.bulkWrite(
            order.items.map((item) => ({
                updateOne: {
                    filter: { _id: item.product, stock: { $gte: item.quantity } },
                    update: { $inc: { stock: -item.quantity } }
                }
            }))
        );

        // Clear the cart only after the payment is verified
        await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

        return res.status(200).json({
            success: true,
            message: 'Payment verified. Order placed successfully',
            order
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// GET /orders - Current user's placed orders, newest first.
// Unpaid checkout attempts (PENDING_PAYMENT) are not listed as orders.
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            status: { $ne: 'PENDING_PAYMENT' }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// GET /orders/:id - One order, only if it belongs to the current user
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await Order.findOne({ _id: id, user: req.user._id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById
};
