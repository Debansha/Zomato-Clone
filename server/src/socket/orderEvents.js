exports.joinOrderRoom = (socket, orderId) => {
  const room = `order:${orderId}`;
  socket.join(room);
  console.log(`User ${socket.user._id} joined room: ${room}`);
};

exports.leaveOrderRoom = (socket, orderId) => {
  const room = `order:${orderId}`;
  socket.leave(room);
  console.log(`User ${socket.user._id} left room: ${room}`);
};

/**
 * Emits an order status update to everyone tracking the order
 */
exports.emitOrderUpdate = (io, orderId, data) => {
  io.to(`order:${orderId}`).emit('orderStatusUpdate', data);
};

/**
 * Notifies a restaurant about a new order
 */
exports.emitNewOrder = (io, restaurantId, order) => {
  io.to(`restaurant:${restaurantId}`).emit('newOrder', order);
};
