// src/controllers/productController.js - UPDATED for Pagination & Filtering

const Product = require('./models/Product');
const mongoose = require('mongoose');

// Helper to check for valid ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. GET /api/products (Read All) - WITH PAGINATION/FILTERING
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Basic Filtering: Filter by SKU if provided in query parameters
        const filter = {};
        if (req.query.sku) {
            filter.sku = req.query.sku; // Exact match filter
        }
        if (req.query.name) {
            // Case-insensitive partial match
            filter.name = { $regex: req.query.name, $options: 'i' }; 
        }

        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalCount = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            count: products.length,
            page,
            limit,
            totalPages,
            totalCount,
            data: products
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching products.' });
    }
};

// --- REMAINING FUNCTIONS (getProductById, createProduct, updateProduct, deleteProduct) ---
// Note: The rest of the functions (getProductById, createProduct, updateProduct, deleteProduct)
// from the previous update remain the same and are not repeated here for brevity, 
// but should be included in your file.
// The code block below includes the complete file for replacement.
exports.getProductById = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Product ID format.' });
    }
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.status(200).json({ data: product });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching product.' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({ data: newProduct });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        if (err.code === 11000) { 
            return res.status(400).json({ error: `Product with SKU ${req.body.sku} already exists.` });
        }
        res.status(500).json({ error: 'Server error creating product.' });
    }
};

exports.updateProduct = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Product ID format.' });
    }
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } 
        );
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.status(200).json({ data: updatedProduct });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Server error updating product.' });
    }
};

exports.deleteProduct = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Product ID format.' });
    }
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.status(204).send(); 
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting product.' });
    }
};
