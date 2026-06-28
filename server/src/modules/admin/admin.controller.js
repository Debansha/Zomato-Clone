const adminService = require('./admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json(ApiResponse.success(stats));
});

exports.getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  res.status(200).json(ApiResponse.paginated(result.users, result.pagination));
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.id);
  res.status(200).json(ApiResponse.success(user, `User ${user.isActive ? 'activated' : 'deactivated'}`));
});

exports.getRestaurants = asyncHandler(async (req, res) => {
  const result = await adminService.getAllRestaurants(req.query);
  res.status(200).json(ApiResponse.paginated(result.restaurants, result.pagination));
});

exports.verifyRestaurant = asyncHandler(async (req, res) => {
  const { isVerified } = req.body;
  const restaurant = await adminService.verifyRestaurant(req.params.id, isVerified);
  res.status(200).json(ApiResponse.success(restaurant, `Restaurant ${isVerified ? 'verified' : 'unverified'}`));
});

exports.getOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getAllOrders(req.query);
  res.status(200).json(ApiResponse.paginated(result.orders, result.pagination));
});

exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getRevenueAnalytics(req.query.period);
  res.status(200).json(ApiResponse.success(analytics));
});

exports.getPopularCuisines = asyncHandler(async (req, res) => {
  const cuisines = await adminService.getPopularCuisines();
  res.status(200).json(ApiResponse.success(cuisines));
});
