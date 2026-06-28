const MenuItem = require('./menuItem.model');
const Restaurant = require('../restaurant/restaurant.model');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');

exports.create = async (restaurantId, ownerId, data) => {
  // Verify restaurant ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found or you are not the owner');
  }

  const menuItem = await MenuItem.create({ ...data, restaurant: restaurantId });
  return menuItem;
};

exports.getByRestaurant = async (restaurantId, filters = {}) => {
  const { isAvailable } = filters;

  const matchStage = { restaurant: new mongoose.Types.ObjectId(restaurantId) };
  if (isAvailable !== undefined) {
    matchStage.isAvailable = isAvailable === 'true' || isAvailable === true;
  }

  const menu = await MenuItem.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        items: { $push: '$$ROOT' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return menu;
};

exports.update = async (itemId, ownerId, data) => {
  // First find the item to get its restaurant
  const item = await MenuItem.findById(itemId);
  if (!item) {
    throw ApiError.notFound('Menu item not found');
  }

  // Verify restaurant ownership
  const restaurant = await Restaurant.findOne({ _id: item.restaurant, owner: ownerId });
  if (!restaurant) {
    throw ApiError.forbidden('You do not have permission to update this item');
  }

  const updatedItem = await MenuItem.findByIdAndUpdate(itemId, data, {
    new: true,
    runValidators: true,
  });

  return updatedItem;
};

exports.delete = async (itemId, ownerId) => {
  const item = await MenuItem.findById(itemId);
  if (!item) {
    throw ApiError.notFound('Menu item not found');
  }

  const restaurant = await Restaurant.findOne({ _id: item.restaurant, owner: ownerId });
  if (!restaurant) {
    throw ApiError.forbidden('You do not have permission to delete this item');
  }

  // Soft delete by making it unavailable
  item.isAvailable = false;
  await item.save();
  return item;
};

exports.toggleAvailability = async (itemId, ownerId) => {
  const item = await MenuItem.findById(itemId);
  if (!item) {
    throw ApiError.notFound('Menu item not found');
  }

  const restaurant = await Restaurant.findOne({ _id: item.restaurant, owner: ownerId });
  if (!restaurant) {
    throw ApiError.forbidden('You do not have permission to modify this item');
  }

  item.isAvailable = !item.isAvailable;
  await item.save();
  return item;
};

exports.getBestsellers = async (restaurantId) => {
  const bestsellers = await MenuItem.find({
    restaurant: restaurantId,
    isAvailable: true,
    isBestseller: true, // or we could sort by orderCount and limit to 5
  }).sort({ orderCount: -1 }).limit(10);
  
  return bestsellers;
};
