const Joi = require('joi');

exports.createRestaurantSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().max(500),
    cuisines: Joi.array().items(Joi.string()).min(1).required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().required(),
    }).required(),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
    }).required(),
    operatingHours: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      days: Joi.array().items(Joi.number().min(0).max(6)).required(),
    }),
    priceRange: Joi.number().valid(1, 2, 3, 4).default(2),
    isVeg: Joi.boolean().default(false),
    preparationTime: Joi.number().min(5).max(120),
    deliveryRadius: Joi.number().min(1).max(50),
    minimumOrder: Joi.number().min(0),
    deliveryFee: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
    images: Joi.array().items(Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    })),
    coverImage: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),
  }),
};

exports.updateRestaurantSchema = {
  body: Joi.object({
    name: Joi.string(),
    description: Joi.string().max(500),
    cuisines: Joi.array().items(Joi.string()).min(1),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
    }),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }),
    operatingHours: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      days: Joi.array().items(Joi.number().min(0).max(6)),
    }),
    priceRange: Joi.number().valid(1, 2, 3, 4),
    isVeg: Joi.boolean(),
    preparationTime: Joi.number().min(5).max(120),
    deliveryRadius: Joi.number().min(1).max(50),
    minimumOrder: Joi.number().min(0),
    deliveryFee: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
  }),
};

exports.queryRestaurantsSchema = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10),
    cuisine: Joi.string(),
    priceRange: Joi.number().valid(1, 2, 3, 4),
    rating: Joi.number().min(1).max(5),
    isVeg: Joi.boolean(),
    sort: Joi.string().valid('rating', 'price_low', 'price_high', 'newest'),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    radius: Joi.number().min(1).max(50).default(10),
  }),
};
