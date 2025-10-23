// src/controllers/supplierController.js - UPDATED for Pagination & Filtering

const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/suppliers (Read All) - WITH PAGINATION/FILTERING
exports.getAllSuppliers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Basic Filtering: Filter by name (case-insensitive partial match)
        const filter = {};
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' }; 
        }

        const suppliers = await Supplier.find(filter)
            .skip(skip)
            .limit(limit);

        const totalCount = await Supplier.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            count: suppliers.length,
            page,
            limit,
            totalPages,
            totalCount,
            data: suppliers
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching suppliers.' });
    }
};

// --- REMAINING FUNCTIONS (getSupplierById, createSupplier, updateSupplier, deleteSupplier) ---
// Note: The rest of the functions from the previous update remain the same.
exports.getSupplierById = async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid Supplier ID format.' });
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });
        res.status(200).json({ data: supplier });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching supplier.' });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json({ data: newSupplier });
    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
        if (err.code === 11000) return res.status(400).json({ error: `Supplier with name '${req.body.name}' already exists.` });
        res.status(500).json({ error: 'Server error creating supplier.' });
    }
};

exports.updateSupplier = async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid Supplier ID format.' });
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSupplier) return res.status(404).json({ error: 'Supplier not found.' });
        res.status(200).json({ data: updatedSupplier });
    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
        res.status(500).json({ error: 'Server error updating supplier.' });
    }
};

exports.deleteSupplier = async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid Supplier ID format.' });
    try {
        const result = await Supplier.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Supplier not found.' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting supplier.' });
    }
};
