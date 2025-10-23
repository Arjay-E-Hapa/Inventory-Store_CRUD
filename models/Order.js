// src/models/Order.js

const mongoose = require('mongoose');

// Define the schema for items nested within the order
const OrderItemSchema = new mongoose.Schema({
    // Reference to the Product model
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // This links it to the Product model
        required: true
    },
    qty: {
        type: Number,
        required: [true, 'Quantity is required for each order item.'],
        min: 1
    },
    price: {
        type: Number,
        required: [true, 'Price is required.'],
        min: 0
    }
}, { _id: false }); // We don't need separate IDs for nested items

// Define the main Order Schema
const OrderSchema = new mongoose.Schema({
    // Array of nested item schemas
    items: {
        type: [OrderItemSchema],
        required: [true, 'Order must contain at least one item.'],
    },
    // Reference to the Supplier model
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier', // This links it to the Supplier model
        required: [true, 'Supplier ID is required for the order.']
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Calculate total amount before saving the order (Good practice!)
OrderSchema.pre('save', function (next) {
    let total = 0;
    this.items.forEach(item => {
        total += item.qty * item.price;
    });
    this.totalAmount = total;
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
