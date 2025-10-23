// src/models/Supplier.js

const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Supplier name is required.'],
        trim: true,
        unique: true
    },
    contact: {
        type: String,
        required: [true, 'Contact information is required.'],
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Supplier', SupplierSchema);