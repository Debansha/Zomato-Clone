const Restaurant = require('./restaurant.model');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');

exports.create = async (ownerId, data) => {
  const restaurant = await Restaurant.create({ ...data, owner: ownerId });
  return restaurant;
};

exports.getAll = async (queryParams) => {
  const { page, limit, cuisine, priceRange, rating, isVeg, sort } = queryParams;
  const { skip, limit: limitNumber } = paginate(page, limit);

  const filter = { isActive: true };
  if (cuisine) filter.cuisines = { $in: [cuisine] };
  if (priceRange) filter.priceRange = priceRange;
  if (rating) filter.avgRating = { $gte: rating };
  if (isVeg !== undefined) filter.isVeg = isVeg === 'true' || isVeg === true;

  let sortOption = { createdAt: -1 }; // newest default
  if (sort === 'rating') sortOption = { avgRating: -1 };
  else if (sort === 'price_low') sortOption = { priceRange: 1 };
  else if (sort === 'price_high') sortOption = { priceRange: -1 };

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .populate('owner', 'name avatar'),
    Restaurant.countDocuments(filter),
  ]);

  return {
    restaurants,
    pagination: {
      page: Number(page) || 1,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

exports.getNearby = async (lng, lat, radiusKm = 10, filters = {}) => {
  const { cuisine, priceRange, rating, isVeg } = filters;

  const matchFilter = { isActive: true };
  if (cuisine) matchFilter.cuisines = { $in: [cuisine] };
  if (priceRange) matchFilter.priceRange = Number(priceRange);
  if (rating) matchFilter.avgRating = { $gte: Number(rating) };
  if (isVeg !== undefined) matchFilter.isVeg = isVeg === 'true' || isVeg === true;

  const restaurants = await Restaurant.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        distanceField: 'distance',
        maxDistance: radiusKm * 1000, // convert km to meters
        spherical: true,
        query: matchFilter,
      },
    },
    { $sort: { distance: 1 } },
  ]);

  return restaurants;
};

exports.getBySlug = async (slug) => {
  const restaurant = await Restaurant.findOne({ slug, isActive: true })
    .populate('owner', 'name avatar');
  
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }
  return restaurant;
};

exports.getById = async (id) => {
  const restaurant = await Restaurant.findById(id).populate('owner', 'name avatar');
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }
  return restaurant;
};

exports.update = async (id, ownerId, data) => {
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: id, owner: ownerId },
    data,
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found or you are not the owner');
  }
  return restaurant;
};

exports.getByOwner = async (ownerId) => {
  const restaurants = await Restaurant.find({ owner: ownerId });
  return restaurants;
};

exports.toggleActive = async (id, ownerId) => {
  const restaurant = await Restaurant.findOne({ _id: id, owner: ownerId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found or you are not the owner');
  }
  
  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();
  return restaurant;
};
