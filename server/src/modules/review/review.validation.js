const Joi = require('joi');

exports.createReviewSchema = {
  body: Joi.object({
    orderId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).allow(''),
    images: Joi.array().items(Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    })).max(5),
  }),
};

exports.updateReviewSchema = {
  body: Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().max(1000).allow(''),
    images: Joi.array().items(Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    })).max(5),
  }),
};
