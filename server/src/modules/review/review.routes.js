const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { createReviewSchema, updateReviewSchema } = require('./review.validation');

// Public routes
router.get('/restaurant/:restaurantId', reviewController.getByRestaurant);
router.get('/restaurant/:restaurantId/distribution', reviewController.getRatingDistribution);

// Protected routes
router.use(authenticate);

router.post('/restaurant/:restaurantId', validate(createReviewSchema), reviewController.create);
router.patch('/:id', validate(updateReviewSchema), reviewController.update);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
