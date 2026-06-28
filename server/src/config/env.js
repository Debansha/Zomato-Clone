/**
 * @module config/env
 * @description Validates and exports all environment variables using Joi.
 * The application will refuse to start if required variables are missing or malformed.
 */

const Joi = require('joi');

const envSchema = Joi.object({
  // Server
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // MongoDB
  MONGODB_URI: Joi.string().uri().required().messages({
    'any.required': 'MONGODB_URI is required — provide a valid MongoDB connection string',
  }),

  // Redis
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_ACCESS_SECRET must be at least 32 characters',
    'any.required': 'JWT_ACCESS_SECRET is required',
  }),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters',
    'any.required': 'JWT_REFRESH_SECRET is required',
  }),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('7d'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required().messages({
    'any.required': 'CLOUDINARY_CLOUD_NAME is required for image uploads',
  }),
  CLOUDINARY_API_KEY: Joi.string().required().messages({
    'any.required': 'CLOUDINARY_API_KEY is required for image uploads',
  }),
  CLOUDINARY_API_SECRET: Joi.string().required().messages({
    'any.required': 'CLOUDINARY_API_SECRET is required for image uploads',
  }),

  // Razorpay
  RAZORPAY_KEY_ID: Joi.string().required().messages({
    'any.required': 'RAZORPAY_KEY_ID is required for payment processing',
  }),
  RAZORPAY_KEY_SECRET: Joi.string().required().messages({
    'any.required': 'RAZORPAY_KEY_SECRET is required for payment processing',
  }),

  // Client
  CLIENT_URL: Joi.string().uri().default('http://localhost:3000'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
})
  .unknown(true); // Allow other env vars (PATH, HOME, etc.)

const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  const messages = error.details.map((d) => `  ✗ ${d.message}`).join('\n');
  console.error(`\n⛔  Environment validation failed:\n${messages}\n`);
  process.exit(1);
}

/** @type {Object} Validated environment configuration */
const config = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  isProduction: envVars.NODE_ENV === 'production',
  isDevelopment: envVars.NODE_ENV === 'development',
  isTest: envVars.NODE_ENV === 'test',

  mongo: {
    uri: envVars.MONGODB_URI,
  },

  redis: {
    url: envVars.REDIS_URL,
  },

  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpiry: envVars.JWT_ACCESS_EXPIRY,
    refreshExpiry: envVars.JWT_REFRESH_EXPIRY,
  },

  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },

  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
  },

  client: {
    url: envVars.CLIENT_URL,
    corsOrigin: envVars.CORS_ORIGIN,
  },
};

module.exports = config;
