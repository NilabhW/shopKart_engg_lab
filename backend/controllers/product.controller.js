const mongoose = require('mongoose');
const Product = require('../models/product.model');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image || price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            })
        }

        if (stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            })
        }

        const newProduct = await Product.create({
            name, description, price, category, image, stock
        })

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: newProduct
        })

    }

    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        })
    }
}


const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' }
        }

        if (category) {
            query.category = category
        }

        let productsQuery = Product.find(query);

        if (sort === 'price_asc') {
            productsQuery = productsQuery.sort({ price: 1 })
        } else if (sort === 'price_desc') {
            productsQuery = productsQuery.sort({ price: -1 })
        }

        const products = await productsQuery;

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })

    }

    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        })
    }
}


const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            })
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            product
        })

    }

    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        })
    }
}

module.exports = { createProduct, getProducts, getProductById }
