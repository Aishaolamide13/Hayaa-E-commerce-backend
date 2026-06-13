const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create review
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
    try {
        const { product, rating, title, comment } = req.body;

        // Check if product exists
        const productExists = await Product.findByPk(product);
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ where: { userId: req.user.id, productId: product } });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Check if user purchased the product
        const allOrders = await Order.findAll({ where: { userId: req.user.id, status: 'delivered' } });
        let hasPurchased = false;
        for (const order of allOrders) {
            const found = order.items.some(item => item.product === product);
            if (found) {
                hasPurchased = true;
                break;
            }
        }

        const review = await Review.create({
            userId: req.user.id,
            productId: product,
            vendorId: productExists.vendorId,
            rating,
            title,
            comment,
            isVerifiedPurchase: !!hasPurchased
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted. Awaiting approval.',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
const getProductReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const where = { productId: req.params.productId, isApproved: true };

        const reviews = await Review.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Review.count({ where });

        // Calculate rating distribution
        const allApprovedReviews = await Review.findAll({
            where: { productId: req.params.productId, isApproved: true }
        });
        const distribution = {};
        for (let i = 1; i <= 5; i++) {
            distribution[i] = 0;
        }
        allApprovedReviews.forEach(r => {
            if (distribution[r.rating] !== undefined) {
                distribution[r.rating]++;
            }
        });
        const ratingDistribution = Object.entries(distribution)
            .map(([rating, count]) => ({ _id: parseInt(rating), count }))
            .sort((a, b) => b._id - a._id);

        res.status(200).json({
            success: true,
            data: reviews,
            ratingDistribution,
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

router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);

module.exports = router;