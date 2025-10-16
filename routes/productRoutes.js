// src/routes/productRoutes.js - UPDATED
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes for /api/products (List and Create)
router.route('/')
    .get(productController.getAllProducts)
    .post(productController.createProduct);

// Routes for /api/products/:id (Read One, Update, Delete)
router.route('/:id')
    .get(productController.getProductById)
    .put(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;