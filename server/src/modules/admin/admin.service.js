const User = require('../auth/user.model');
const Restaurant = require('../restaurant/restaurant.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');

exports.getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const [
    totalUsers,
    totalRestaurants,
    totalOrders,
    revenueAgg,
    ordersToday,
    newUsersThisWeek
  ] = await Promise.all([
    User.countDocuments(),
    Restaurant.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: startOfWeek } })
  ]);

  return {
    totalUsers,
    totalRestaurants,
    totalOrders,
    totalRevenue: revenueAgg.length > 0 ? revenueAgg[0].total : 0,
    ordersToday,
    newUsersThisWeek
  };
};

exports.getAllUsers = async (queryParams) => {
  const { page, limit, role, search } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      page: Number(page) || 1,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    }
  };
};

exports.toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.badRequest('Cannot toggle admin status');

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  return user;
};

exports.getAllRestaurants = async (queryParams) => {
  const { page, limit, status, search } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const filter = {};
  if (status === 'verified') filter.isVerified = true;
  if (status === 'pending') filter.isVerified = false;
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Restaurant.countDocuments(filter)
  ]);

  return {
    restaurants,
    pagination: {
      page: Number(page) || 1,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    }
  };
};

exports.verifyRestaurant = async (restaurantId, isVerified) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { isVerified },
    { new: true }
  );
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  return restaurant;
};

exports.getAllOrders = async (queryParams) => {
  const { page, limit, status, startDate, endDate } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const filter = {};
  if (status && status !== 'all') filter.status = status;
  
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('deliveryPartner', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
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

exports.getRevenueAnalytics = async (period = 'day') => {
  let groupByFormat = '%Y-%m-%d';
  if (period === 'month') groupByFormat = '%Y-%m';
  if (period === 'year') groupByFormat = '%Y';

  const analytics = await Order.aggregate([
    { $match: { status: 'delivered' } },
    {
      $group: {
        _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return analytics;
};

exports.getPopularCuisines = async () => {
  const cuisines = await Order.aggregate([
    { $match: { status: 'delivered' } },
    {
      $lookup: {
        from: 'restaurants',
        localField: 'restaurant',
        foreignField: '_id',
        as: 'restaurantData'
      }
    },
    { $unwind: '$restaurantData' },
    { $unwind: '$restaurantData.cuisines' },
    {
      $group: {
        _id: '$restaurantData.cuisines',
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { ordersCount: -1 } },
    { $limit: 10 }
  ]);

  return cuisines;
};
