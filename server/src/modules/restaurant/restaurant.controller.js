const restaurantService = require('./restaurant.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

exports.create = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.create(req.user.id, req.body);
  res.status(201).json(ApiResponse.created(restaurant, 'Restaurant created successfully'));
});

exports.getAll = asyncHandler(async (req, res) => {
  const result = await restaurantService.getAll(req.query);
  res.status(200).json(ApiResponse.paginated(result.restaurants, result.pagination));
});

exports.getNearby = asyncHandler(async (req, res) => {
  const { lat, lng, radius, ...filters } = req.query;
  
  if (!lat || !lng) {
    throw ApiError.badRequest('Latitude and longitude are required for nearby search');
  }

  const restaurants = await restaurantService.getNearby(lng, lat, radius, filters);
  res.status(200).json(ApiResponse.success(restaurants));
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getBySlug(req.params.slug);
  res.status(200).json(ApiResponse.success(restaurant));
});

exports.update = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.update(req.params.id, req.user.id, req.body);
  res.status(200).json(ApiResponse.success(restaurant, 'Restaurant updated successfully'));
});

exports.getMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantService.getByOwner(req.user.id);
  res.status(200).json(ApiResponse.success(restaurants));
});

exports.toggleActive = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.toggleActive(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success(restaurant, `Restaurant is now ${restaurant.isActive ? 'active' : 'inactive'}`));
});
