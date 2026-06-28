const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { placeOrderSchema, updateStatusSchema, cancelOrderSchema } = require('./order.validation');

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', validate(placeOrderSchema), orderController.placeOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder);

// Restaurant owner & Delivery partner routes
router.get('/restaurant/:restaurantId', authorize('restaurant_owner'), orderController.getRestaurantOrders);
router.patch('/:id/status', authorize('restaurant_owner', 'delivery_partner', 'admin'), validate(updateStatusSchema), orderController.updateStatus);

module.exports = router;
