const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createCategory,
    getCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Public
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin only
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;