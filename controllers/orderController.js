const { Op } = require('sequelize');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Create order from cart
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod = 'pay_on_delivery', notes } = req.body;

        const cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate stock
        for (const item of cart.items) {
            const product = await Product.findByPk(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }
            if (product.status !== 'published') {
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" is not available`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`
                });
            }
        }

        // Build order items with vendor info
        const orderItems = [];
        for (const item of cart.items) {
            const product = await Product.findByPk(item.product);
            const images = product.images || [];
            const primaryImage = images.find(img => img.isPrimary)?.url || images[0]?.url || '';

            orderItems.push({
                product: product.id,
                vendor: product.vendorId,
                name: product.name,
                image: primaryImage,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
                variant: item.variant || undefined,
                status: 'pending'
            });
        }

        // Calculate totals
        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
        const shippingCost = req.body.shippingCost || 0;
        const tax = req.body.tax || 0;
        const discount = req.body.discount || 0;
        const total = subtotal + shippingCost + tax - discount;

        const order = await Order.create({
            userId: req.user.id,
            items: orderItems,
            shippingAddress: shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'pay_on_delivery' ? 'pending' : 'pending',
            subtotal,
            shippingCost,
            tax,
            discount,
            total,
            notes
        });

        // Reduce stock for each product
        for (const item of orderItems) {
            const product = await Product.findByPk(item.product);
            if (product) {
                await product.update({
                    stock: product.stock - item.quantity,
                    totalSold: (product.totalSold || 0) + item.quantity
                });
            }

            // Update vendor total sales
            const vendor = await Vendor.findByPk(item.vendor);
            if (vendor) {
                await vendor.update({ totalSales: vendor.totalSales + item.quantity });
            }
        }

        // Clear the cart
        cart.items = [];
        cart.subtotal = 0;
        cart.total = 0;
        await cart.save();

        // Get populated order
        const populatedOrder = await Order.findByPk(order.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
        });

        // Add product details to items
        const populatedItems = [];
        for (const item of populatedOrder.items) {
            const prod = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images']
            });
            populatedItems.push({ ...item, productDetails: prod || null });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: { ...populatedOrder.toJSON(), items: populatedItems }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user orders
// @route   GET /api/orders
const getMyOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;

        const orders = await Order.findAll({
            where,
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Order.count({ where });

        // Enrich with product details
        const enrichedOrders = [];
        for (const order of orders) {
            const enrichedItems = [];
            for (const item of order.items) {
                const prod = await Product.findByPk(item.product, {
                    attributes: ['id', 'name', 'slug', 'price', 'images']
                });
                enrichedItems.push({ ...item, productDetails: prod || null });
            }
            enrichedOrders.push({ ...order.toJSON(), items: enrichedItems });
        }

        res.status(200).json({
            success: true,
            data: enrichedOrders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership
        if (order.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        // Enrich with product details
        const enrichedItems = [];
        for (const item of order.items) {
            const prod = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images']
            });
            enrichedItems.push({ ...item, productDetails: prod || null });
        }

        res.status(200).json({
            success: true,
            data: { ...order.toJSON(), items: enrichedItems }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own orders'
            });
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = req.body.reason || 'Cancelled by customer';
        await order.save();

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findByPk(item.product);
            if (product) {
                await product.update({
                    stock: product.stock + item.quantity,
                    totalSold: Math.max(0, (product.totalSold || 0) - item.quantity)
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
const getOrderByNumber = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            where: { orderNumber: req.params.orderNumber },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Enrich with product details
        const enrichedItems = [];
        for (const item of order.items) {
            const prod = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images']
            });
            enrichedItems.push({ ...item, productDetails: prod || null });
        }

        res.status(200).json({
            success: true,
            data: { ...order.toJSON(), items: enrichedItems }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getOrderByNumber
};