const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { createPaymentOrderSchema, verifyPaymentSchema } = require('./payment.validation');

// All payment routes require authentication
router.use(authenticate);

router.post('/create-order', validate(createPaymentOrderSchema), paymentController.createPaymentOrder);
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);
router.get('/order/:orderId', paymentController.getPayment);

module.exports = router;
