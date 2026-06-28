/**
 * @fileoverview Request validation middleware using Joi schemas.
 * Validates req.body, req.query, or req.params against provided Joi schemas.
 */

const ApiError = require('../utils/ApiError');

/**
 * Creates a validation middleware for the specified request property.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body'|'query'|'params'} [property='body'] - Request property to validate
 * @returns {import('express').RequestHandler} Express middleware
 *
 * @example
 * router.post('/users', validate(createUserSchema), createUser);
 * router.get('/users', validate(querySchema, 'query'), getUsers);
 */
const validate = (schema, property = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      throw ApiError.badRequest('Validation failed', errorMessages);
    }

    // Replace request property with validated (and stripped) value
    req[property] = value;
    next();
  };
};

module.exports = validate;
