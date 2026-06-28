const express = require('express');
const router = express.Router();
const restaurantController = require('./restaurant.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  queryRestaurantsSchema,
} = require('./restaurant.validation');

// Public routes
router.get('/', validate(queryRestaurantsSchema), restaurantController.getAll);
router.get('/nearby', validate(queryRestaurantsSchema), restaurantController.getNearby);
router.get('/:slug', restaurantController.getBySlug);

// Protected routes
router.use(authenticate);

// Restaurant owner routes
router.get('/owner/my-restaurants', authorize('restaurant_owner'), restaurantController.getMyRestaurants);
router.post('/', authorize('restaurant_owner'), validate(createRestaurantSchema), restaurantController.create);
router.patch('/:id', authorize('restaurant_owner'), validate(updateRestaurantSchema), restaurantController.update);
router.patch('/:id/toggle', authorize('restaurant_owner'), restaurantController.toggleActive);

module.exports = router;
