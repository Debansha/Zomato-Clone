const Restaurant = require('../restaurant/restaurant.model');
const MenuItem = require('../menu/menuItem.model');

exports.searchRestaurants = async (query, filters = {}) => {
  const { lat, lng, cuisine, priceRange, rating, isVeg, limit = 10, page = 1 } = filters;
  const skip = (page - 1) * limit;

  // Build match filter
  const matchFilter = { isActive: true };
  if (query) {
    matchFilter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { cuisines: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (cuisine) matchFilter.cuisines = { $in: [cuisine] };
  if (priceRange) matchFilter.priceRange = Number(priceRange);
  if (rating) matchFilter.avgRating = { $gte: Number(rating) };
  if (isVeg !== undefined) matchFilter.isVeg = isVeg === 'true' || isVeg === true;

  // If geo coordinates provided, use geoNear, else regular find
  if (lat && lng) {
    return await Restaurant.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          distanceField: 'distance',
          maxDistance: 50000, // 50km
          spherical: true,
          query: matchFilter,
        },
      },
      { $sort: { distance: 1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ]);
  } else {
    return await Restaurant.find(matchFilter)
      .sort({ avgRating: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('name slug coverImage avgRating cuisines priceRange address location distance isVeg deliveryRadius');
  }
};

exports.searchMenuItems = async (query, limit = 10) => {
  if (!query) return [];

  const items = await MenuItem.find({
    name: { $regex: query, $options: 'i' },
    isAvailable: true
  })
    .populate('restaurant', 'name slug coverImage')
    .limit(Number(limit))
    .select('name price image isVeg restaurant description');

  return items;
};

exports.searchAll = async (query, filters = {}) => {
  const [restaurants, dishes] = await Promise.all([
    this.searchRestaurants(query, { ...filters, limit: 5 }),
    this.searchMenuItems(query, 5)
  ]);

  return {
    restaurants,
    dishes
  };
};

exports.getSuggestions = async (query) => {
  if (!query || query.length < 2) return { restaurants: [], dishes: [] };

  const [restaurants, dishes] = await Promise.all([
    Restaurant.find({ 
      name: { $regex: `^${query}`, $options: 'i' },
      isActive: true 
    })
      .limit(5)
      .select('name slug coverImage'),
      
    MenuItem.find({ 
      name: { $regex: `^${query}`, $options: 'i' },
      isAvailable: true 
    })
      .limit(5)
      .select('name image restaurant')
      .populate('restaurant', 'slug')
  ]);

  return { restaurants, dishes };
};
