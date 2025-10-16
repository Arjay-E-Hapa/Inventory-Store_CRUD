// src/app.js

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Existing DB import (adjusted for your config folder structure)
const { connectDB } = require('./config/db'); 

// NEW: IMPORT ROUTERS
const productRoutes = require('./routes/productRoutes'); 
const supplierRoutes = require('./routes/supplierRoutes'); 
const orderRoutes = require('./routes/orderRoutes'); // <--- 1. NEW IMPORT

const app = express();
app.use(express.json()); // Parses incoming JSON payloads
app.use(morgan('dev'));  // Request logging middleware
app.use(cors());         // Enables Cross-Origin Resource Sharing

// MOUNT ROUTERS
app.use('/api/products', productRoutes); 
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/orders', orderRoutes); // <--- 2. NEW MOUNTING

// Health check route
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)));