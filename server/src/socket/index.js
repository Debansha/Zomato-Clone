const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../modules/auth/user.model');
const { joinOrderRoom, leaveOrderRoom } = require('./orderEvents');
const { updateDeliveryLocation } = require('./deliveryEvents');

exports.initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id} (${socket.user.role})`);

    // Join room based on user ID for personal notifications
    socket.join(`user:${socket.user._id}`);

    // If restaurant owner, join restaurant room
    if (socket.user.role === 'restaurant_owner') {
      socket.join(`owner:${socket.user._id}`);
      // Actual restaurant ID joining should ideally happen after client tells us which restaurant they're managing
      socket.on('joinRestaurant', (restaurantId) => {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`Owner ${socket.user._id} joined restaurant:${restaurantId}`);
      });
    }

    // Order tracking events
    socket.on('joinOrder', (orderId) => joinOrderRoom(socket, orderId));
    socket.on('leaveOrder', (orderId) => leaveOrderRoom(socket, orderId));

    // Delivery partner events
    if (socket.user.role === 'delivery_partner') {
      socket.on('updateLocation', (data) => updateDeliveryLocation(io, socket, data));
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};
