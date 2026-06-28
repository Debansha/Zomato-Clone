/**
 * Handles location updates from delivery partners
 */
exports.updateDeliveryLocation = (io, socket, data) => {
  const { orderId, lat, lng } = data;
  
  if (!orderId || !lat || !lng) return;

  // Broadcast the location to everyone tracking this order (usually the customer)
  exports.emitLocationUpdate(io, orderId, {
    lat,
    lng,
    timestamp: new Date()
  });
};

/**
 * Emits the delivery partner's location to the order room
 */
exports.emitLocationUpdate = (io, orderId, locationData) => {
  io.to(`order:${orderId}`).emit('deliveryLocationUpdate', locationData);
};
