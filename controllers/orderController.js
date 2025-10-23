// src/controllers/orderController.js - FIXED

const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- HELPER FUNCTION: Stock Management ---
async function manageStock(order, action, session) {
    // action: 'restock' (for delete/cancel) or 'deduct' (for initial create)
    for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
            // FIXED: Removed double 'new' keyword
            throw new Error(`Product not found for ID: ${item.productId}`);
        }

        const change = item.qty;
        
        if (action === 'restock') {
            // Add quantity back to stock (e.g., order cancelled or deleted)
            product.stock += change;
        } else if (action === 'deduct') {
            // Deduct quantity from stock (e.g., initial creation)
            if (product.stock < change) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }
            product.stock -= change;
        }

        await product.save({ session });
    }
}

// 1. POST /api/orders (Create)
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, supplierId, status } = req.body;

        if (!isValidId(supplierId)) throw new Error('Invalid Supplier ID format.');
        const supplierExists = await Supplier.findById(supplierId).session(session);
        if (!supplierExists) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Supplier not found.' });
        }

        let totalAmount = 0;
        const processedItems = [];
        
        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(400).json({ error: `Product not found for ID: ${item.productId}` });
            }
            
            // Check stock and deduct (will throw error if insufficient)
            if (product.stock < item.qty) {
                await session.abortTransaction();
                return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
            }
            product.stock -= item.qty;
            await product.save({ session });

            processedItems.push({
                productId: item.productId,
                qty: item.qty,
                price: product.price // Use current price at time of order
            });
            totalAmount += item.qty * product.price;
        }

        // 2. Create the Order
        const newOrder = await Order.create([{
            items: processedItems,
            supplierId,
            status: status || 'Pending',
            totalAmount
        }], { session });

        await session.commitTransaction();
        res.status(201).json({ data: newOrder[0] }); 

    } catch (err) {
        await session.abortTransaction();
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: `Server error creating order: ${err.message}` });
    } finally {
        session.endSession();
    }
};

// 2. GET /api/orders (Read All) - WITH PAGINATION/FILTERING
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Basic Filtering: Filter by status if provided
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const ordersQuery = Order.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('supplierId', 'name contact') 
            .populate('items.productId', 'name sku');
        
        const orders = await ordersQuery;
        const totalCount = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            count: orders.length,
            page,
            limit,
            totalPages,
            totalCount,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching orders.' }); 
    }
};

// 3. GET /api/orders/:id (Read One)
exports.getOrderById = async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid Order ID format.' });
    try {
        const order = await Order.findById(req.params.id)
            .populate('supplierId', 'name contact') 
            .populate('items.productId', 'name sku'); 
            
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.status(200).json({ data: order });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching order.' });
    }
};

// 4. PUT /api/orders/:id (Update)
exports.updateOrder = async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid Order ID format.' });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const oldOrder = await Order.findById(req.params.id).session(session);
        if (!oldOrder) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Order not found.' });
        }
        
        const newStatus = req.body.status;

        if (newStatus && newStatus === 'Cancelled' && oldOrder.status !== 'Cancelled') {
            await manageStock(oldOrder, 'restock', session);
        } else if (newStatus && newStatus !== 'Cancelled' && oldOrder.status === 'Cancelled') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Cannot reactivate a cancelled order. Create a new one.' });
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, session }
        ).populate('supplierId', 'name contact').populate('items.productId', 'name sku');

        await session.commitTransaction();
        res.status(200).json({ data: updatedOrder });

    } catch (err) {
        await session.abortTransaction();
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: `Server error updating order: ${err.message}` });
    } finally {
        session.endSession();
    }
};

// 5. DELETE /api/orders/:id (Delete)
exports.deleteOrder = async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid Order ID format.' });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderToDelete = await Order.findById(req.params.id).session(session);
        if (!orderToDelete) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Order not found.' });
        }
        
        // 1. Restock products before deletion if it wasn't already cancelled
        if (orderToDelete.status !== 'Cancelled') {
            await manageStock(orderToDelete, 'restock', session);
        }

        // 2. Delete the order itself
        await Order.findByIdAndDelete(req.params.id, { session });

        await session.commitTransaction();
        
        res.status(200).json({
            message: `Order ${req.params.id} successfully deleted.`,
            deletedOrder: orderToDelete
        });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: `Server error deleting order: ${err.message}` });
    } finally {
        session.endSession();
    }
};
