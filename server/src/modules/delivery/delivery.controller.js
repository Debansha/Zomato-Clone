const deliveryService = require('./delivery.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
// const { emitLocationUpdate } = require('../../socket/deliveryEvents');

exports.register = asyncHandler(async (req, res) => {
  const partner = await deliveryService.registerAsPartner(req.user.id, req.body);
  res.status(201).json(ApiResponse.created(partner, 'Registered as delivery partner successfully'));
});

exports.toggleOnline = asyncHandler(async (req, res) => {
  const partner = await deliveryService.toggleOnline(req.user.id);
  res.status(200).json(ApiResponse.success(
    { isOnline: partner.isOnline, isAvailable: partner.isAvailable }, 
    `You are now ${partner.isOnline ? 'online' : 'offline'}`
  ));
});

exports.getAvailableOrders = asyncHandler(async (req, res) => {
  const { lng, lat, radius } = req.query;
  const orders = await deliveryService.getAvailableOrders(Number(lng), Number(lat), Number(radius));
  res.status(200).json(ApiResponse.success(orders));
});

exports.acceptOrder = asyncHandler(async (req, res) => {
  const order = await deliveryService.acceptOrder(req.user.id, req.params.orderId);
  res.status(200).json(ApiResponse.success(order, 'Order accepted successfully'));
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const partner = await deliveryService.updateLocation(req.user.id, latitude, longitude);
  
  // Emit socket event if partner has an active order
  if (partner.activeOrder) {
    // const io = req.app.get('io');
    // if (io) emitLocationUpdate(io, partner.activeOrder, { lat: latitude, lng: longitude, timestamp: Date.now() });
  }

  res.status(200).json(ApiResponse.success(null, 'Location updated'));
});

exports.completeDelivery = asyncHandler(async (req, res) => {
  const result = await deliveryService.completeDelivery(req.user.id, req.params.orderId);
  res.status(200).json(ApiResponse.success(result, 'Delivery completed successfully'));
});

exports.getEarnings = asyncHandler(async (req, res) => {
  const earnings = await deliveryService.getEarnings(req.user.id, req.query.period);
  res.status(200).json(ApiResponse.success(earnings));
});

exports.getHistory = asyncHandler(async (req, res) => {
  const result = await deliveryService.getDeliveryHistory(req.user.id, req.query);
  res.status(200).json(ApiResponse.paginated(result.orders, result.pagination));
});
