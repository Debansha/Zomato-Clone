const orderService = require('./order.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
// We will emit socket events from the controller when status changes
// const { emitOrderUpdate, emitNewOrder } = require('../../socket/orderEvents');

exports.placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user.id, req.body);
  
  // Real-time: Notify restaurant about new order
  // const io = req.app.get('io');
  // if (io) emitNewOrder(io, order.restaurant, order);
  
  res.status(201).json(ApiResponse.created(order, 'Order placed successfully'));
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrdersByUser(req.user.id, req.query);
  res.status(200).json(ApiResponse.paginated(result.orders, result.pagination));
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
  res.status(200).json(ApiResponse.success(order));
});

exports.getRestaurantOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrdersByRestaurant(req.params.restaurantId, req.user.id, req.query);
  res.status(200).json(ApiResponse.paginated(result.orders, result.pagination));
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateStatus(req.params.id, status, req.user.id, req.user.role);
  
  // Real-time: Notify stakeholders about status change
  // const io = req.app.get('io');
  // if (io) emitOrderUpdate(io, order._id, { status, timestamp: new Date() });

  res.status(200).json(ApiResponse.success(order, `Order status updated to ${status}`));
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;
  const order = await orderService.cancelOrder(req.params.id, req.user.id, cancelReason);
  
  // Real-time: Notify restaurant about cancellation
  // const io = req.app.get('io');
  // if (io) emitOrderUpdate(io, order._id, { status: 'cancelled', reason: cancelReason });

  res.status(200).json(ApiResponse.success(order, 'Order cancelled successfully'));
});
