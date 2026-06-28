/**
 * @module config/cloudinary
 * @description Configures and exports the Cloudinary v2 SDK instance.
 */

const { v2: cloudinary } = require('cloudinary');
const config = require('./env');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true, // Always use HTTPS URLs
});

module.exports = cloudinary;
