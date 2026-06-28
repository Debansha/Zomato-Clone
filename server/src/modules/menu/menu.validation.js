const Joi = require('joi');

exports.createMenuItemSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid(
      'recommended', 'starters', 'main_course', 'breads', 
      'rice', 'desserts', 'beverages', 'combos', 'sides'
    ).required(),
    isVeg: Joi.boolean().required(),
    spiceLevel: Joi.number().valid(0, 1, 2, 3).default(1),
    preparationTime: Joi.number().min(1).max(120),
    customizations: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      required: Joi.boolean().default(false),
      options: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        extraPrice: Joi.number().min(0).default(0),
      })).min(1).required(),
    })),
    image: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),
  }),
};

exports.updateMenuItemSchema = {
  body: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number().min(0),
    category: Joi.string().valid(
      'recommended', 'starters', 'main_course', 'breads', 
      'rice', 'desserts', 'beverages', 'combos', 'sides'
    ),
    isVeg: Joi.boolean(),
    isAvailable: Joi.boolean(),
    spiceLevel: Joi.number().valid(0, 1, 2, 3),
    preparationTime: Joi.number().min(1).max(120),
    customizations: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      required: Joi.boolean().default(false),
      options: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        extraPrice: Joi.number().min(0).default(0),
      })).min(1).required(),
    })),
    image: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),
  }),
};
