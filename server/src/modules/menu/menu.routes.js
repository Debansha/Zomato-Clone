const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createMenuItemSchema, updateMenuItemSchema } = require('./menu.validation');

// Public routes
router.get('/restaurant/:restaurantId', menuController.getByRestaurant);
router.get('/restaurant/:restaurantId/bestsellers', menuController.getBestsellers);

// Protected routes (Restaurant Owner)
router.use(authenticate, authorize('restaurant_owner'));

router.post('/restaurant/:restaurantId', validate(createMenuItemSchema), menuController.create);
router.patch('/:itemId', validate(updateMenuItemSchema), menuController.update);
router.delete('/:itemId', menuController.deleteItem);
router.patch('/:itemId/toggle', menuController.toggleAvailability);

module.exports = router;
