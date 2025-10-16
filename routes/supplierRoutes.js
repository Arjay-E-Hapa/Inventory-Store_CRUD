// src/routes/supplierRoutes.js

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Routes for /api/suppliers
router.route('/')
    .get(supplierController.getAllSuppliers)
    .post(supplierController.createSupplier);

// Routes for /api/suppliers/:id
router.route('/:id')
    .get(supplierController.getSupplierById)
    .put(supplierController.updateSupplier)
    .delete(supplierController.deleteSupplier);

module.exports = router;