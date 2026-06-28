const Joi = require('joi');

exports.addItemSchema = {
  body: Joi.object({
    menuItemId: Joi.string().required(), // Will be converted to ObjectId in mongoose
    quantity: Joi.number().min(1).max(20).default(1),
    customizations: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      selectedOption: Joi.string().required(),
      extraPrice: Joi.number().min(0).default(0),
    })),
  }),
};

exports.updateItemSchema = {
  body: Joi.object({
    quantity: Joi.number().min(0).max(20).required(), // 0 means remove item
  }),
};
