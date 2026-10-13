const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById
} = require('../controllers/order.controller');

router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
// Alias so POST /orders behaves the same as create-payment-order
router.post('/', authMiddleware, createPaymentOrder);
router.get('/', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
