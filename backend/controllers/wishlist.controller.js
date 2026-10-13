const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// POST /wishlist/:productId - Add product to wishlist
const addToWishlist = async (req, res) => {
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

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const isAlreadyInWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isAlreadyInWishlist) {
            return res.status(409).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// GET /wishlist - Get current user's wishlist
const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price category image stock description'
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Filter out any populated items that might be null (e.g. if product was deleted)
        const activeWishlist = (customer.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: activeWishlist.length,
            wishlist: activeWishlist
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// DELETE /wishlist/:productId - Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const itemIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in wishlist'
            });
        }

        customer.wishlist.splice(itemIndex, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

// PATCH /wishlist/:productId/toggle - Bonus Wishlist Toggle
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const itemIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (itemIndex > -1) {
            // Remove
            customer.wishlist.splice(itemIndex, 1);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: 'Product removed from wishlist'
            });
        } else {
            // Add
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: 'Product added to wishlist'
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
};
