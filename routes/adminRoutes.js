const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Vendor management
router.get('/vendors', getVendors);
router.put('/vendors/:id/verify', verifyVendor);
router.put('/vendors/:id/status', toggleVendorStatus);
router.put('/vendors/:id/featured', toggleFeaturedVendor);

// Product management
router.get('/products', getProducts);
router.put('/products/:id/status', updateProductStatus);
router.put('/products/:id/featured', toggleFeaturedProduct);

// Order management
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);

// Review management
router.get('/reviews', getReviews);
router.put('/reviews/:id/status', updateReviewStatus);

module.exports = router;