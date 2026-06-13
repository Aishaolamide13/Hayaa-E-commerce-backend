const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
    createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductBySlug,
    getProductById
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);

// Vendor only (MUST be before :slug route)
router.get('/mine/all', protect, authorize('vendor'), getMyProducts);
router.post('/', protect, authorize('vendor'), createProduct);
router.get('/:slug', optionalAuth, getProductBySlug);
router.get('/:id/edit', protect, authorize('vendor'), getProductById);
router.put('/:id', protect, authorize('vendor'), updateProduct);
router.delete('/:id', protect, authorize('vendor'), deleteProduct);

module.exports = router;