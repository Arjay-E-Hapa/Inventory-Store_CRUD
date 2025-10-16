// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Routes for /api/orders (List and Create)
router.route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createOrder);

// Routes for /api/orders/:id (Read One, Update, Delete)
router.route('/:id')
    .get(orderController.getOrderById)
    .put(orderController.updateOrder)
    .delete(orderController.deleteOrder);

module.exports = router;
