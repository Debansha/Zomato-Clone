const Cart = require('./cart.model');
const MenuItem = require('../menu/menuItem.model');
const Restaurant = require('../restaurant/restaurant.model');
const ApiError = require('../../utils/ApiError');

exports.getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate('restaurant', 'name slug coverImage deliveryFee minimumOrder')
    .populate('items.menuItem', 'name price image isVeg isAvailable');

  if (!cart) {
    // Return empty cart structure if not found
    return {
      user: userId,
      items: [],
      totalAmount: 0,
      totalItems: 0,
    };
  }

  return cart;
};

exports.addItem = async (userId, itemData) => {
  const { menuItemId, quantity = 1, customizations = [] } = itemData;

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  if (!menuItem.isAvailable) {
    throw ApiError.badRequest('This item is currently unavailable');
  }

  let cart = await Cart.findOne({ user: userId });

  // Calculate item total based on base price + customizations
  const customizationExtra = customizations.reduce((sum, c) => sum + (c.extraPrice || 0), 0);
  const itemTotal = (menuItem.price + customizationExtra) * quantity;

  const newItem = {
    menuItem: menuItemId,
    name: menuItem.name,
    price: menuItem.price,
    quantity,
    customizations,
    itemTotal,
  };

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      user: userId,
      restaurant: menuItem.restaurant,
      items: [newItem],
    });
  } else {
    // Check if adding item from a different restaurant
    if (cart.restaurant && cart.restaurant.toString() !== menuItem.restaurant.toString()) {
      // For Zomato clone, we clear the cart if adding from a different restaurant
      cart.items = [];
      cart.restaurant = menuItem.restaurant;
    }

    // Check if item with same customizations already exists
    const existingItemIndex = cart.items.findIndex((item) => {
      // Convert to string for comparison
      const isSameItem = item.menuItem.toString() === menuItemId.toString();
      
      // Compare customizations (simple length and exact match for this basic implementation)
      // In a real app, you'd sort and deep compare the customizations array
      const isSameCustomizations = JSON.stringify(item.customizations) === JSON.stringify(customizations);
      
      return isSameItem && isSameCustomizations;
    });

    if (existingItemIndex > -1) {
      // Update quantity and itemTotal if exact item exists
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].itemTotal = 
        (menuItem.price + customizationExtra) * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push(newItem);
    }

    await cart.save();
  }

  return await this.getCart(userId);
};

exports.updateItemQuantity = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId.toString());
  if (itemIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  if (quantity === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity and itemTotal
    const item = cart.items[itemIndex];
    const customizationExtra = item.customizations.reduce((sum, c) => sum + (c.extraPrice || 0), 0);
    
    item.quantity = quantity;
    item.itemTotal = (item.price + customizationExtra) * quantity;
  }

  if (cart.items.length === 0) {
    cart.restaurant = null; // Clear restaurant if cart is empty
  }

  await cart.save();
  return await this.getCart(userId);
};

exports.removeItem = async (userId, itemId) => {
  return await this.updateItemQuantity(userId, itemId, 0);
};

exports.clearCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], restaurant: null, totalAmount: 0, totalItems: 0 },
    { new: true }
  );
  return { items: [], totalAmount: 0, totalItems: 0 };
};
