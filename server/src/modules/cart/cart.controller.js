const cartService = require('./cart.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json(ApiResponse.success(cart));
});

exports.addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  res.status(200).json(ApiResponse.success(cart, 'Item added to cart'));
});

exports.updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity(req.user.id, req.params.itemId, req.body.quantity);
  res.status(200).json(ApiResponse.success(cart, 'Cart updated'));
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.itemId);
  res.status(200).json(ApiResponse.success(cart, 'Item removed from cart'));
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.status(200).json(ApiResponse.success(cart, 'Cart cleared'));
});
