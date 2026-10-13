const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const PRODUCT_FIELDS = 'name price image stock category';

// Loads the customer's cart with the latest Product data.
// Items whose product has since been deleted are dropped from the response.
const getPopulatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: 'cart.product',
        select: PRODUCT_FIELDS
    });

    if (!customer) return null;

    return customer.cart
        .filter((item) => item.product !== null)
        .map((item) => ({
            product: item.product,
            quantity: item.quantity
        }));
};

const stockMessage = (product) =>
    product.stock === 0
        ? `${product.name} is out of stock`
        : `Only ${product.stock} unit(s) of ${product.name} available`;

// POST /cart/:productId - Add product to cart (or increment its quantity)
const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const customerId = req.user._id;

        // Already in cart: atomically +1, but only while quantity < stock
        const incremented = await Customer.updateOne(
            {
                _id: customerId,
                cart: { $elemMatch: { product: product._id, quantity: { $lt: product.stock } } }
            },
            { $inc: { 'cart.$.quantity': 1 } }
        );

        if (incremented.modifiedCount === 0) {
            const alreadyInCart = await Customer.exists({ _id: customerId, 'cart.product': product._id });

            if (alreadyInCart || product.stock < 1) {
                return res.status(400).json({
                    success: false,
                    message: stockMessage(product)
                });
            }

            // Not in cart yet: push a new row (the $ne guard prevents duplicate rows)
            await Customer.updateOne(
                { _id: customerId, 'cart.product': { $ne: product._id } },
                { $push: { cart: { product: product._id, quantity: 1 } } }
            );
        }

        const cart = await getPopulatedCart(customerId);

        return res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// GET /cart - Get current user's cart
const getCart = async (req, res) => {
    try {
        const cart = await getPopulatedCart(req.user._id);
        if (!cart) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        return res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// PATCH /cart/:productId - Set quantity for a product already in the cart
const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a whole number'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: stockMessage(product)
            });
        }

        const result = await Customer.updateOne(
            { _id: req.user._id, 'cart.product': product._id },
            { $set: { 'cart.$.quantity': quantity } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        const cart = await getPopulatedCart(req.user._id);

        return res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// DELETE /cart/:productId - Remove product from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const result = await Customer.updateOne(
            { _id: req.user._id, 'cart.product': productId },
            { $pull: { cart: { product: productId } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        const cart = await getPopulatedCart(req.user._id);

        return res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart
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
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
};
