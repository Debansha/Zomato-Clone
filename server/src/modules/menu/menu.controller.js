const menuService = require('./menu.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const menuItem = await menuService.create(req.params.restaurantId, req.user.id, req.body);
  res.status(201).json(ApiResponse.created(menuItem, 'Menu item created successfully'));
});

exports.getByRestaurant = asyncHandler(async (req, res) => {
  const menu = await menuService.getByRestaurant(req.params.restaurantId, req.query);
  res.status(200).json(ApiResponse.success(menu));
});

exports.getBestsellers = asyncHandler(async (req, res) => {
  const bestsellers = await menuService.getBestsellers(req.params.restaurantId);
  res.status(200).json(ApiResponse.success(bestsellers));
});

exports.update = asyncHandler(async (req, res) => {
  const menuItem = await menuService.update(req.params.itemId, req.user.id, req.body);
  res.status(200).json(ApiResponse.success(menuItem, 'Menu item updated successfully'));
});

exports.deleteItem = asyncHandler(async (req, res) => {
  await menuService.delete(req.params.itemId, req.user.id);
  res.status(200).json(ApiResponse.success(null, 'Menu item deleted successfully'));
});

exports.toggleAvailability = asyncHandler(async (req, res) => {
  const menuItem = await menuService.toggleAvailability(req.params.itemId, req.user.id);
  res.status(200).json(
    ApiResponse.success(menuItem, `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`)
  );
});
