// --- 1. Dependencies and Initialization ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (like MONGODB_URI)
dotenv.config(); 

const app = express();

// --- 2. Database Connection Logic (Replacing config/db.js) ---
const MONGODB_URI = process.env.MONGODB_URI;

// **Crucial Fix:** Ensure MONGODB_URI has the typo fixed on Vercel:
// It must be: mongodb+srv://... and NOT MONmongodb+srv://...

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            // These options are often included for stable connections
            serverSelectionTimeoutMS: 5000, 
        });
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        // Exit process if connection fails to prevent server from running with no DB
        process.exit(1); 
    }
};

// Execute the connection function
connectDB();

// --- 3. Mongoose Product Model (Replacing models/productModel.js) ---
const productSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 }
}, {
    timestamps: true 
});

const Product = mongoose.model('Product', productSchema);

// --- 4. Middleware Setup ---
app.use(cors()); // Enable CORS for all origins (matching your original headers)
app.use(express.json()); // Body parsing

// --- 5. Product Controller Logic (Replacing controllers/productController.js) ---
const getProducts = async (req, res) => {
    try {
        // Find all products in the database
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        // This catches the error if the DB query fails (e.g., if DB connection was lost)
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Server error fetching products." });
    }
};

// --- 6. Routing (Replacing routes/productRoutes.js) ---
// Note: We use the base path '/api' here because Vercel often maps the endpoint path.
// The request was sent to: https://inventory-store-crud.vercel.app/api/products
// So the route should be set up relative to '/api'.

// Health Check Endpoint (from README.md)
app.get('/health', (req, res) => {
    // Check if MongoDB state is connected (1)
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.status(200).json({
        status: 'ok',
        database: dbStatus,
        uptime: process.uptime()
    });
});

// Products Route - GET /api/products
app.get('/api/products', getProducts); 

// --- 7. Server Listener (For Local Development) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// --- 8. Export for Vercel Serverless Function ---
// Vercel requires the Express app instance to be exported
module.exports = app;
