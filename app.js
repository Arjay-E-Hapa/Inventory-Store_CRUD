// src/app.js

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

// DB import
const { connectDB } = require('./config/db'); 

// IMPORT ROUTERS
const productRoutes = require('./routes/productRoutes'); 
const supplierRoutes = require('./routes/supplierRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); // ADD USER ROUTES

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// MOUNT ROUTERS
app.use('/api/products', productRoutes); 
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // MOUNT USER ROUTES

// Health check route
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)));

// Export for Vercel
module.exports = app;
