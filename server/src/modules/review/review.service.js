const Review = require('./review.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');

exports.createReview = async (userId, restaurantId, data) => {
  const { orderId, rating, comment, images } = data;

  // 1. Verify user had a completed order at this restaurant
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    restaurant: restaurantId,
    status: 'delivered',
  });

  if (!order) {
    throw ApiError.badRequest('You can only review restaurants after a completed delivery');
  }

  // 2. Check if review already exists for this order
  const existingReview = await Review.findOne({ user: userId, order: orderId });
  if (existingReview) {
    throw ApiError.badRequest('You have already reviewed this order');
  }

  // 3. Create review
  const review = await Review.create({
    user: userId,
    restaurant: restaurantId,
    order: orderId,
    rating,
    comment,
    images,
  });

  // Update order with rating
  order.rating = rating;
  await order.save();

  return review;
};

exports.getByRestaurant = async (restaurantId, queryParams) => {
  const { page, limit, sort } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  let sortOption = { createdAt: -1 }; // newest default
  if (sort === 'highest') sortOption = { rating: -1 };
  if (sort === 'lowest') sortOption = { rating: 1 };

  const [reviews, total] = await Promise.all([
    Review.find({ restaurant: restaurantId })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .populate('user', 'name avatar'),
    Review.countDocuments({ restaurant: restaurantId }),
  ]);

  return {
    reviews,
    pagination: {
      page: Number(page) || 1,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

exports.update = async (reviewId, userId, data) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) {
    throw ApiError.notFound('Review not found or you are not the author');
  }

  if (data.rating) review.rating = data.rating;
  if (data.comment !== undefined) review.comment = data.comment;
  if (data.images) review.images = data.images;
  
  review.isEdited = true;
  await review.save(); // This will trigger the post-save hook to update restaurant rating

  return review;
};

exports.delete = async (reviewId, userId, userRole) => {
  let query = { _id: reviewId };
  // If not admin, verify ownership
  if (userRole !== 'admin') {
    query.user = userId;
  }

  const review = await Review.findOneAndDelete(query);
  if (!review) {
    throw ApiError.notFound('Review not found or unauthorized');
  }

  return review;
};

exports.getRatingDistribution = async (restaurantId) => {
  const distribution = await Review.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } }, // 5, 4, 3, 2, 1
  ]);

  // Format response to ensure all 1-5 ratings are present even if count is 0
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalReviews = 0;

  distribution.forEach((item) => {
    result[item._id] = item.count;
    totalReviews += item.count;
  });

  return {
    distribution: result,
    totalReviews,
  };
};
