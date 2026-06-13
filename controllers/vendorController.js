const { Op } = require('sequelize');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper to create slug
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
};

// @desc    Apply to become a vendor / Register store
// @route   POST /api/vendors/apply
const applyVendor = async (req, res, next) => {
    try {
        const { storeName, storeDescription, contactPhone, contactEmail, address, specialties } = req.body;

        // Check if already a vendor
        const existingVendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (existingVendor) {
            return res.status(400).json({
                success: false,
                message: 'You already have a vendor account'
            });
        }

        const storeSlug = createSlug(storeName);

        // Check slug uniqueness
        const slugExists = await Vendor.findOne({ where: { storeSlug } });
        if (slugExists) {
            return res.status(400).json({
                success: false,
                message: 'Store name already taken. Please choose another.'
            });
        }

        const vendor = await Vendor.create({
            userId: req.user.id,
            storeName,
            storeSlug,
            storeDescription,
            contactPhone,
            contactEmail: contactEmail || req.user.email,
            address,
            specialties: specialties || [],
            verificationStatus: 'pending',
            complianceStatus: 'pending'
        });

        // Update user role to vendor
        await User.update({ role: 'vendor' }, { where: { id: req.user.id } });

        res.status(201).json({
            success: true,
            message: 'Vendor application submitted successfully. Awaiting admin approval.',
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
const getVendorProfile = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({
            where: { userId: req.user.id },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }]
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        // Get vendor stats
        const totalProducts = await Product.count({ where: { vendorId: vendor.id } });
        const orders = await Order.findAll();
        const orderItems = orders.flatMap(o => o.items);
        const vendorOrders = orderItems.filter(item => item.vendor === vendor.id);
        const totalOrders = vendorOrders.length;

        res.status(200).json({
            success: true,
            data: {
                ...vendor.toJSON(),
                stats: { totalProducts, totalOrders }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
const updateVendorProfile = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const { storeName, storeDescription, contactPhone, contactEmail, address, specialties } = req.body;

        if (storeName && storeName !== vendor.storeName) {
            const storeSlug = createSlug(storeName);
            const slugExists = await Vendor.findOne({ where: { storeSlug, id: { [Op.ne]: vendor.id } } });
            if (slugExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Store name already taken'
                });
            }
            vendor.storeName = storeName;
            vendor.storeSlug = storeSlug;
        }
        if (storeDescription) vendor.storeDescription = storeDescription;
        if (contactPhone) vendor.contactPhone = contactPhone;
        if (contactEmail) vendor.contactEmail = contactEmail;
        if (address) vendor.address = { ...(typeof vendor.address === 'object' ? vendor.address : {}), ...address };
        if (specialties) vendor.specialties = specialties;

        await vendor.save();

        res.status(200).json({
            success: true,
            message: 'Vendor profile updated',
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
const getVendorDashboard = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const totalProducts = await Product.count({ where: { vendorId: vendor.id } });
        const publishedProducts = await Product.count({ where: { vendorId: vendor.id, status: 'published' } });
        const pendingProducts = await Product.count({ where: { vendorId: vendor.id, status: 'pending' } });
        const lowStockProducts = await Product.count({
            where: { vendorId: vendor.id, stock: { [Op.lte]: 10 } }
        });

        // Get all orders and filter by vendor items
        const allOrders = await Order.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
        const orders = allOrders.filter(order =>
            order.items.some(item => item.vendor === vendor.id)
        );

        // Calculate total revenue from paid orders
        let totalRevenue = 0;
        const paidOrders = await Order.findAll({ where: { paymentStatus: 'paid' } });
        paidOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.vendor === vendor.id) {
                    totalRevenue += item.total || 0;
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                vendor,
                stats: {
                    totalProducts,
                    publishedProducts,
                    pendingProducts,
                    lowStockProducts,
                    totalRevenue,
                    totalSales: vendor.totalSales
                },
                recentOrders: orders
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor orders
// @route   GET /api/vendors/orders
const getVendorOrders = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const { status, page = 1, limit = 20 } = req.query;

        const allOrders = await Order.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });

        // Filter orders that contain this vendor's items
        let orders = allOrders.filter(order =>
            order.items.some(item => item.vendor === vendor.id)
        );

        if (status) {
            orders = orders.filter(order =>
                order.items.some(item => item.vendor === vendor.id && item.status === status)
            );
        }

        const total = orders.length;
        const startIdx = (page - 1) * limit;
        const paginatedOrders = orders.slice(startIdx, startIdx + Number(limit));

        res.status(200).json({
            success: true,
            data: paginatedOrders,
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

// @desc    Update order item status (vendor side)
// @route   PUT /api/vendors/orders/:orderId/items/:itemId
const updateOrderItemStatus = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const { status } = req.body;
        const order = await Order.findByPk(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const items = order.items;
        const itemIndex = parseInt(req.params.itemId);

        if (itemIndex < 0 || itemIndex >= items.length) {
            return res.status(404).json({
                success: false,
                message: 'Order item not found'
            });
        }

        const item = items[itemIndex];
        if (item.vendor !== vendor.id) {
            return res.status(404).json({
                success: false,
                message: 'Order item not found'
            });
        }

        item.status = status;
        order.items = items;
        await order.save();

        res.status(200).json({
            success: true,
            message: `Order item status updated to ${status}`,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public vendor store
// @route   GET /api/vendors/store/:slug
const getPublicStore = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({
            where: { storeSlug: req.params.slug, isActive: true, verificationStatus: 'verified' }
        });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
        const sortOrder = sort.startsWith('-')
            ? [[sort.substring(1), 'DESC']]
            : [[sort, 'ASC']];

        const products = await Product.findAll({
            where: { vendorId: vendor.id, status: 'published' },
            include: [{ model: require('../models/Category'), as: 'category', attributes: ['id', 'name', 'slug'] }],
            order: sortOrder,
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const totalProducts = await Product.count({ where: { vendorId: vendor.id, status: 'published' } });

        res.status(200).json({
            success: true,
            data: {
                store: vendor,
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalProducts,
                    pages: Math.ceil(totalProducts / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyVendor,
    getVendorProfile,
    updateVendorProfile,
    getVendorDashboard,
    getVendorOrders,
    updateOrderItemStatus,
    getPublicStore
};