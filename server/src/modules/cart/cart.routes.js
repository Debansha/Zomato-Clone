const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { addItemSchema, updateItemSchema } = require('./cart.validation');

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addItemSchema), cartController.addItem);
router.patch('/items/:itemId', validate(updateItemSchema), cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
