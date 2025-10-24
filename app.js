// app.js - Complete Vercel-optimized version

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// IMPORT ROUTERS
const productRoutes = require('./routes/productRoutes'); 
const supplierRoutes = require('./routes/supplierRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Database connection with caching for serverless
let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached database connection');
    return cachedDb;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI missing from environment variables');
  }

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = connection;
    console.log('✅ MongoDB connected');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// Connect to DB on each request (serverless pattern)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// MOUNT ROUTERS
app.use('/api/products', productRoutes); 
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    mongooseState: mongoose.connection.readyState,
    env: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Inventory Management API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      suppliers: '/api/suppliers',
      orders: '/api/orders',
      users: '/api/users',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

// Export for Vercel
module.exports = app;
