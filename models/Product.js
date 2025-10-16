// src/models/Product.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: [true, 'SKU (Stock Keeping Unit) is required.'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required.']
    },
    price: {
        type: Number,
        required: [true, 'Price is required.'],
        min: [0, 'Price must be a positive number.']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required.'],
        min: [0, 'Stock cannot be negative.'],
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Product', ProductSchema);