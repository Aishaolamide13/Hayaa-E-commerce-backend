const { Op } = require('sequelize');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Category = require('../models/Category');

// ============= DASHBOARD =============

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        const totalCustomers = await User.count({ where: { role: 'customer' } });
        const totalVendors = await User.count({ where: { role: 'vendor' } });
        const totalProducts = await Product.count();
        const publishedProducts = await Product.count({ where: { status: 'published' } });
        const pendingProducts = await Product.count({ where: { status: 'pending' } });
        const totalOrders = await Order.count();
        
        // Calculate total revenue
        const allOrders = await Order.findAll({ where: { paymentStatus: 'paid' } });
        let totalRevenue = 0;
        allOrders.forEach(order => {
            totalRevenue += order.total || 0;
        });
        
        const pendingVendors = await Vendor.count({ where: { complianceStatus: 'pending' } });
        const totalCategories = await Category.count();

        res.status(200).json({
            success: true,
            data: {
                users: { total: totalUsers, customers: totalCustomers, vendors: totalVendors },
                products: { total: totalProducts, published: publishedProducts, pending: pendingProducts },
                orders: { total: totalOrders },
                revenue: totalRevenue,
                pendingVendors,
                categories: totalCategories
            }
        });
    } catch (error) {
        next(error);
    }
};

// ============= VENDOR MANAGEMENT =============

// @desc    Get all vendors
// @route   GET /api/admin/vendors
const getVendors = async (req, res, next) => {
    try {
        const { status, verification, page = 1, limit = 20 } = req.query;
        const where = {};

        if (status) where.complianceStatus = status;
        if (verification) where.verificationStatus = verification;

        const vendors = await Vendor.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'createdAt'] }],
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Vendor.count({ where });

        res.status(200).json({
            success: true,
            data: vendors,
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

// @desc    Approve/reject vendor
// @route   PUT /api/admin/vendors/:id/verify
const verifyVendor = async (req, res, next) => {
    try {
        const { verificationStatus, complianceStatus, commissionRate } = req.body;
        const vendor = await Vendor.findByPk(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        if (verificationStatus) vendor.verificationStatus = verificationStatus;
        if (complianceStatus) vendor.complianceStatus = complianceStatus;
        if (commissionRate !== undefined) vendor.commissionRate = commissionRate;

        await vendor.save();

        // If rejected, revert user role
        if (verificationStatus === 'rejected') {
            await User.update({ role: 'customer' }, { where: { id: vendor.userId } });
        }

        res.status(200).json({
            success: true,
            message: `Vendor ${verificationStatus || complianceStatus} successfully`,
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Suspend/activate vendor
// @route   PUT /api/admin/vendors/:id/status
const toggleVendorStatus = async (req, res, next) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        vendor.isActive = !vendor.isActive;
        await vendor.save();

        // Also toggle user's active status
        await User.update({ isActive: vendor.isActive }, { where: { id: vendor.userId } });

        res.status(200).json({
            success: true,
            message: `Vendor ${vendor.isActive ? 'activated' : 'suspended'} successfully`,
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

// ============= PRODUCT MANAGEMENT =============

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
const getProducts = async (req, res, next) => {
    try {
        const { status, vendor, page = 1, limit = 20 } = req.query;
        const where = {};

        if (status) where.status = status;
        if (vendor) where.vendorId = vendor;

        const products = await Product.findAll({
            where,
            include: [
                { model: Vendor, as: 'vendor', attributes: ['id', 'storeName', 'storeSlug'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Product.count({ where });

        res.status(200).json({
            success: true,
            data: products,
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

// @desc    Approve/reject product
// @route   PUT /api/admin/products/:id/status
const updateProductStatus = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.status = status;
        if (adminNotes) product.adminNotes = adminNotes;
        if (status === 'published') product.publishedAt = new Date();

        await product.save();

        res.status(200).json({
            success: true,
            message: `Product ${status} successfully`,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle product featured
// @route   PUT /api/admin/products/:id/featured
const toggleFeaturedProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.featured = !product.featured;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Product ${product.featured ? 'featured' : 'unfeatured'} successfully`,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// ============= ORDER MANAGEMENT =============

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = {};

        if (status) where.status = status;

        const orders = await Order.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
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
                    attributes: ['id', 'name', 'slug', 'price']
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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, trackingNumber, adminNotes } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (adminNotes) order.adminNotes = adminNotes;
        if (status === 'delivered') order.deliveredAt = new Date();

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// ============= USER MANAGEMENT =============

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const where = {};

        if (role) where.role = role;

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await User.count({ where });

        res.status(200).json({
            success: true,
            data: users,
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

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        // If vendor, also toggle vendor
        if (user.role === 'vendor') {
            await Vendor.update({ isActive: user.isActive }, { where: { userId: user.id } });
        }

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        next(error);
    }
};

// ============= REVIEWS MANAGEMENT =============

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
const getReviews = async (req, res, next) => {
    try {
        const { isApproved, page = 1, limit = 20 } = req.query;
        const where = {};

        if (isApproved !== undefined) where.isApproved = isApproved === 'true';

        const reviews = await Review.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }
            ],
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Review.count({ where });

        res.status(200).json({
            success: true,
            data: reviews,
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

// @desc    Approve/reject review
// @route   PUT /api/admin/reviews/:id/status
const updateReviewStatus = async (req, res, next) => {
    try {
        const { isApproved, adminReply } = req.body;
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (isApproved !== undefined) review.isApproved = isApproved;
        if (adminReply) {
            review.adminReply = { comment: adminReply, repliedAt: new Date() };
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: `Review ${isApproved ? 'approved' : 'rejected'}`,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// ============= FEATURED VENDORS =============

// @desc    Toggle featured vendor
// @route   PUT /api/admin/vendors/:id/featured
const toggleFeaturedVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        vendor.isFeatured = !vendor.isFeatured;
        await vendor.save();

        res.status(200).json({
            success: true,
            message: `Vendor ${vendor.isFeatured ? 'featured' : 'unfeatured'}`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    getVendors,
    verifyVendor,
    toggleVendorStatus,
    getProducts,
    updateProductStatus,
    toggleFeaturedProduct,
    getOrders,
    updateOrderStatus,
    getUsers,
    toggleUserStatus,
    getReviews,
    updateReviewStatus,
    toggleFeaturedVendor
};