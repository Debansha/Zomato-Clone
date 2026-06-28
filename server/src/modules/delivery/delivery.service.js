const DeliveryPartner = require('./deliveryPartner.model');
const User = require('../auth/user.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');

exports.registerAsPartner = async (userId, data) => {
  // Check if already registered
  const existingPartner = await DeliveryPartner.findOne({ user: userId });
  if (existingPartner) {
    throw ApiError.badRequest('You are already registered as a delivery partner');
  }

  // Create partner profile
  const partner = await DeliveryPartner.create({
    user: userId,
    vehicleType: data.vehicleType,
    vehicleNumber: data.vehicleNumber,
  });

  // Update user role
  await User.findByIdAndUpdate(userId, { role: 'delivery_partner' });

  return partner;
};

exports.toggleOnline = async (userId) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw ApiError.notFound('Delivery partner profile not found');
  }

  partner.isOnline = !partner.isOnline;
  
  // If going offline, cannot have an active order
  if (!partner.isOnline && partner.activeOrder) {
    throw ApiError.badRequest('Cannot go offline while you have an active order');
  }

  partner.isAvailable = partner.isOnline && !partner.activeOrder;
  await partner.save();

  return partner;
};

exports.getAvailableOrders = async (lng, lat, radiusKm = 10) => {
  // Find orders that are ready to be picked up but have no delivery partner assigned
  const availableOrders = await Order.aggregate([
    {
      $match: {
        status: 'ready',
        deliveryPartner: { $exists: false },
      },
    },
    {
      $lookup: {
        from: 'restaurants',
        localField: 'restaurant',
        foreignField: '_id',
        as: 'restaurantData',
      },
    },
    { $unwind: '$restaurantData' },
    // Filter by distance (basic approximation, ideal would be full geo query)
    {
      $project: {
        orderNumber: 1,
        totalAmount: 1,
        deliveryFee: 1,
        tip: 1,
        estimatedDeliveryTime: 1,
        restaurantData: {
          name: 1,
          address: 1,
          location: 1,
        },
        deliveryAddress: 1,
        // Approximate distance calculation using Pythagorean theorem on lat/lng (for simple filtering)
        distanceFromPartner: {
          $sqrt: {
            $add: [
              { $pow: [{ $subtract: [{ $arrayElemAt: ['$restaurantData.location.coordinates', 0] }, lng] }, 2] },
              { $pow: [{ $subtract: [{ $arrayElemAt: ['$restaurantData.location.coordinates', 1] }, lat] }, 2] }
            ]
          }
        }
      }
    },
    { $sort: { distanceFromPartner: 1, createdAt: 1 } },
    { $limit: 20 }
  ]);

  return availableOrders;
};

exports.acceptOrder = async (userId, orderId) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw ApiError.notFound('Delivery partner profile not found');
  }

  if (!partner.isOnline) {
    throw ApiError.badRequest('You must be online to accept orders');
  }

  if (partner.activeOrder) {
    throw ApiError.badRequest('You already have an active order');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.deliveryPartner) {
    throw ApiError.badRequest('This order has already been assigned to another partner');
  }

  if (order.status !== 'ready' && order.status !== 'preparing') {
    throw ApiError.badRequest(`Cannot accept order in ${order.status} status`);
  }

  // Assign order
  order.deliveryPartner = userId;
  await order.save();

  // Update partner status
  partner.activeOrder = orderId;
  partner.isAvailable = false;
  await partner.save();

  return order;
};

exports.updateLocation = async (userId, lat, lng) => {
  const partner = await DeliveryPartner.findOneAndUpdate(
    { user: userId },
    { 
      currentLocation: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    },
    { new: true }
  );

  if (!partner) {
    throw ApiError.notFound('Delivery partner profile not found');
  }

  return partner;
};

exports.completeDelivery = async (userId, orderId) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw ApiError.notFound('Delivery partner profile not found');
  }

  const order = await Order.findOne({ _id: orderId, deliveryPartner: userId });
  if (!order) {
    throw ApiError.notFound('Order not found or you are not assigned to it');
  }

  if (order.status !== 'on_the_way') {
    throw ApiError.badRequest('Order must be "on_the_way" before it can be delivered');
  }

  // Update order
  order.status = 'delivered';
  order.actualDeliveryTime = Date.now();
  order.statusHistory.push({ status: 'delivered', note: 'Order delivered successfully' });
  await order.save();

  // Calculate earnings (delivery fee + tip)
  const earnings = (order.deliveryFee || 0) + (order.tip || 0);

  // Update partner
  partner.activeOrder = null;
  partner.isAvailable = partner.isOnline; // available again if still online
  partner.totalDeliveries += 1;
  partner.totalEarnings += earnings;
  await partner.save();

  return { order, earnings };
};

exports.getEarnings = async (userId, period = 'today') => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw ApiError.notFound('Delivery partner profile not found');
  }

  // Simple implementation for demo. Real app would aggregate by date range.
  return {
    totalEarnings: partner.totalEarnings,
    totalDeliveries: partner.totalDeliveries,
    avgRating: partner.avgRating
  };
};

exports.getDeliveryHistory = async (userId, queryParams) => {
  const { page, limit } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const [orders, total] = await Promise.all([
    Order.find({ deliveryPartner: userId, status: 'delivered' })
      .sort({ actualDeliveryTime: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('restaurant', 'name location'),
    Order.countDocuments({ deliveryPartner: userId, status: 'delivered' })
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
