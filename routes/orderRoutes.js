const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getOrderByNumber
} = require('../controllers/orderController');

router.use(protect); // All order routes require auth

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/number/:orderNumber', getOrderByNumber);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;