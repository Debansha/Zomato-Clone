const Joi = require('joi');

exports.registerPartnerSchema = {
  body: Joi.object({
    vehicleType: Joi.string().valid('bicycle', 'motorcycle', 'scooter', 'car').default('motorcycle'),
    vehicleNumber: Joi.string().required(),
  }),
};

exports.updateLocationSchema = {
  body: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
};
