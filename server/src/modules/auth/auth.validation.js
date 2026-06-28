const Joi = require('joi');

exports.registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
    }),
    role: Joi.string().valid('customer', 'restaurant_owner', 'delivery_partner', 'admin'),
  }),
};

exports.loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

exports.updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
    }),
    avatar: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),
  }),
};

exports.addAddressSchema = {
  body: Joi.object({
    label: Joi.string().valid('Home', 'Work', 'Other').required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
    }),
  }),
};
