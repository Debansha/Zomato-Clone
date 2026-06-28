const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Restaurant = require('../restaurant/restaurant.model');
const ApiError = require('../../utils/ApiError');
const { paginate, calculateDistance, calculateETA } = require('../../utils/helpers');

exports.placeOrder = async (userId, orderData) => {
  const { deliveryAddress, paymentMethod, deliveryInstructions, tip = 0, couponCode } = orderData;

  // 1. Get user cart
  const cart = await Cart.findOne({ user: userId }).populate('restaurant');
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  const restaurant = cart.restaurant;

  // 2. Verify restaurant is active
  if (!restaurant.isActive) {
    throw ApiError.badRequest('This restaurant is currently not accepting orders');
  }

  // 3. Verify minimum order amount
  if (cart.totalAmount < restaurant.minimumOrder) {
    throw ApiError.badRequest(`Minimum order amount for this restaurant is ₹${restaurant.minimumOrder}`);
  }

  // 4. Calculate ETA based on distance
  const distance = calculateDistance(
    restaurant.location.coordinates[1],
    restaurant.location.coordinates[0],
    deliveryAddress.location.coordinates[1],
    deliveryAddress.location.coordinates[0]
  );

  if (distance > restaurant.deliveryRadius) {
    throw ApiError.badRequest(`Delivery address is outside the restaurant's delivery area (${restaurant.deliveryRadius}km limit)`);
  }

  const eta = calculateETA(distance, restaurant.preparationTime);

  // 5. Calculate final amounts
  const subtotal = cart.totalAmount;
  const deliveryFee = restaurant.deliveryFee || 0;
  const platformFee = 5;
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  
  // Basic discount logic for demo
  let discount = 0;
  if (couponCode === 'WELCOME50' && subtotal >= 200) {
    discount = Math.min(50, subtotal * 0.5); // 50% off up to ₹50
  }

  const totalAmount = subtotal + deliveryFee + platformFee + gstAmount - discount + tip;

  // 6. Create the order
  const order = await Order.create({
    user: userId,
    restaurant: restaurant._id,
    items: cart.items.map(item => ({
      menuItem: item.menuItem,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations,
      itemTotal: item.itemTotal
    })),
    subtotal,
    deliveryFee,
    platformFee,
    gstAmount,
    discount,
    tip,
    totalAmount,
    couponCode,
    status: 'placed',
    paymentMethod,
    deliveryAddress,
    estimatedDeliveryTime: eta,
    deliveryInstructions,
  });

  // 7. Clear the cart
  await Cart.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0, totalItems: 0, restaurant: null });

  // Increment restaurant order count
  await Restaurant.findByIdAndUpdate(restaurant._id, { $inc: { totalOrders: 1 } });

  return order;
};

exports.getOrdersByUser = async (userId, queryParams) => {
  const { page, limit } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('restaurant', 'name slug coverImage'),
    Order.countDocuments({ user: userId })
  ]);

  return {
    orders,
    pagination: {
      page: Number(page) || 1,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    }
  };
};

exports.getOrderById = async (orderId, userId, role) => {
  const order = await Order.findById(orderId)
    .populate('restaurant', 'name address location phone coverImage')
    .populate('deliveryPartner', 'name phone avatar')
    .populate('user', 'name phone');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Access control
  if (
    role !== 'admin' && 
    order.user._id.toString() !== userId && 
    order.restaurant.owner?.toString() !== userId &&
    order.deliveryPartner?._id.toString() !== userId
  ) {
    // Need to verify if the user is the restaurant owner for this order
    if (role === 'restaurant_owner') {
      const restaurant = await Restaurant.findById(order.restaurant._id);
      if (restaurant.owner.toString() !== userId) {
        throw ApiError.forbidden('You do not have permission to view this order');
      }
    } else {
      throw ApiError.forbidden('You do not have permission to view this order');
    }
  }

  return order;
};

exports.getOrdersByRestaurant = async (restaurantId, ownerId, queryParams) => {
  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  if (!restaurant) {
    throw ApiError.forbidden('You do not have permission to view these orders');
  }

  const { page, limit, status } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const filter = { restaurant: restaurantId };
  if (status && status !== 'all') {
    if (status === 'active') {
      filter.status = { $in: ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'] };
    } else if (status === 'past') {
      filter.status = { $in: ['delivered', 'cancelled'] };
    } else {
      filter.status = status;
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('user', 'name phone avatar'),
    Order.countDocuments(filter)
  ]);

  return {
    orders,
    pagination: {
      page: Number(page) || 1,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    }
  };
};

exports.updateStatus = async (orderId, status, userId, role) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Define allowed transitions
  const validTransitions = {
    'placed': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready'],
    'ready': ['picked_up'],
    'picked_up': ['on_the_way'],
    'on_the_way': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  if (!validTransitions[order.status].includes(status)) {
    throw ApiError.badRequest(`Cannot transition order from ${order.status} to ${status}`);
  }

  // Verify permissions based on role and status transition
  if (role === 'restaurant_owner') {
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant.owner.toString() !== userId) {
      throw ApiError.forbidden('You do not own this restaurant');
    }
    const restaurantAllowedStatus = ['confirmed', 'preparing', 'ready', 'cancelled'];
    if (!restaurantAllowedStatus.includes(status)) {
      throw ApiError.forbidden(`Restaurant owner cannot set status to ${status}`);
    }
  } else if (role === 'delivery_partner') {
    if (order.deliveryPartner && order.deliveryPartner.toString() !== userId) {
      throw ApiError.forbidden('You are not assigned to this order');
    }
    const deliveryAllowedStatus = ['picked_up', 'on_the_way', 'delivered'];
    if (!deliveryAllowedStatus.includes(status)) {
      throw ApiError.forbidden(`Delivery partner cannot set status to ${status}`);
    }
  }

  order.status = status;
  order.statusHistory.push({ status, note: `Status updated to ${status}` });
  
  if (status === 'delivered') {
    order.actualDeliveryTime = Date.now();
  }

  await order.save();
  return order;
};

exports.cancelOrder = async (orderId, userId, reason) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (!['placed', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest(`Order cannot be cancelled in ${order.status} status`);
  }

  order.status = 'cancelled';
  order.cancelReason = reason;
  order.statusHistory.push({ status: 'cancelled', note: reason });
  
  await order.save();
  return order;
};

exports.assignDeliveryPartner = async (orderId, deliveryPartnerId) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { deliveryPartner: deliveryPartnerId },
    { new: true }
  );
  return order;
};
