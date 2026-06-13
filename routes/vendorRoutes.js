const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    applyVendor,
    getVendorProfile,
    updateVendorProfile,
    getVendorDashboard,
    getVendorOrders,
    updateOrderItemStatus,
    getPublicStore
} = require('../controllers/vendorController');

// Public
router.get('/store/:slug', getPublicStore);

// Protected - Vendor only
router.post('/apply', protect, applyVendor);
router.get('/profile', protect, authorize('vendor'), getVendorProfile);
router.put('/profile', protect, authorize('vendor'), updateVendorProfile);
router.get('/dashboard', protect, authorize('vendor'), getVendorDashboard);
router.get('/orders', protect, authorize('vendor'), getVendorOrders);
router.put('/orders/:orderId/items/:itemId', protect, authorize('vendor'), updateOrderItemStatus);

module.exports = router;