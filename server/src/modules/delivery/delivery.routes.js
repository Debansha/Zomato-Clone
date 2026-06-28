const express = require('express');
const router = express.Router();
const deliveryController = require('./delivery.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { registerPartnerSchema, updateLocationSchema } = require('./delivery.validation');

// All delivery routes require authentication
router.use(authenticate);

// Register as delivery partner (any user can do this to become a partner)
router.post('/register', validate(registerPartnerSchema), deliveryController.register);

// Partner routes - require delivery_partner role
router.use(authorize('delivery_partner'));

router.patch('/toggle-online', deliveryController.toggleOnline);
router.get('/available-orders', deliveryController.getAvailableOrders);
router.post('/accept/:orderId', deliveryController.acceptOrder);
router.patch('/location', validate(updateLocationSchema), deliveryController.updateLocation);
router.post('/complete/:orderId', deliveryController.completeDelivery);
router.get('/earnings', deliveryController.getEarnings);
router.get('/history', deliveryController.getHistory);

module.exports = router;
