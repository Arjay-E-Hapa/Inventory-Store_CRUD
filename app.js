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
const userRoutes = require('./routes/userRoutes'); 

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// MOUNT ROUTERS
app.use('/api/products', productRoutes); 
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); 

// Health check route and default Express response
// Note: Vercel will correctly route requests to these API paths
app.get('/health', (_req, res) => res.json({ ok: true }));

// 1. 🟢 Connect to the database immediately upon function invocation
connectDB(); 

// 2. 🟢 EXPORT THE APP INSTANCE ONLY
// This is the ONLY thing Vercel needs to run your API.
module.exports = app;

// 3. 🟡 OPTIONAL: If you want to keep local development separate
/*
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  // Only listen if run directly (i.e., not by Vercel)
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}
*/
