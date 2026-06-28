const Joi = require('joi');

exports.placeOrderSchema = {
  body: Joi.object({
    deliveryAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().required(),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      }).required(),
    }).required(),
    paymentMethod: Joi.string().valid('online', 'cod').default('online'),
    deliveryInstructions: Joi.string().max(200),
    tip: Joi.number().min(0).default(0),
    couponCode: Joi.string(),
  }),
};

exports.updateStatusSchema = {
  body: Joi.object({
    status: Joi.string().valid(
      'placed', 'confirmed', 'preparing', 'ready', 
      'picked_up', 'on_the_way', 'delivered', 'cancelled'
    ).required(),
  }),
};

exports.cancelOrderSchema = {
  body: Joi.object({
    cancelReason: Joi.string().required(),
  }),
};
