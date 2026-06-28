const reviewService = require('./review.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.params.restaurantId, req.body);
  res.status(201).json(ApiResponse.created(review, 'Review added successfully'));
});

exports.getByRestaurant = asyncHandler(async (req, res) => {
  const result = await reviewService.getByRestaurant(req.params.restaurantId, req.query);
  res.status(200).json(ApiResponse.paginated(result.reviews, result.pagination));
});

exports.getRatingDistribution = asyncHandler(async (req, res) => {
  const distribution = await reviewService.getRatingDistribution(req.params.restaurantId);
  res.status(200).json(ApiResponse.success(distribution));
});

exports.update = asyncHandler(async (req, res) => {
  const review = await reviewService.update(req.params.id, req.user.id, req.body);
  res.status(200).json(ApiResponse.success(review, 'Review updated successfully'));
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await reviewService.delete(req.params.id, req.user.id, req.user.role);
  res.status(200).json(ApiResponse.success(null, 'Review deleted successfully'));
});
