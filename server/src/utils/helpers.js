const slugify = require('slugify');
const crypto = require('crypto');

/**
 * Generates a URL-friendly slug from a string with a random suffix
 * @param {string} text - The text to slugify
 * @returns {string} - The generated slug
 */
exports.generateSlug = (text) => {
  const baseSlug = slugify(text, { lower: true, strict: true });
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${baseSlug}-${randomSuffix}`;
};

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates estimated delivery time based on distance and preparation time
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} prepTimeMin - Preparation time in minutes
 * @returns {number} - Estimated time of arrival in minutes
 */
exports.calculateETA = (distanceKm, prepTimeMin = 15) => {
  // Average speed of delivery partner in city traffic: ~20 km/h (3 mins per km)
  const travelTimeMin = distanceKm * 3;
  // Add 5 mins buffer for pickup and drop-off
  const bufferTime = 5;
  return Math.ceil(prepTimeMin + travelTimeMin + bufferTime);
};

/**
 * Formats a number as INR currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Generates a random 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Utility for Mongoose pagination
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} - { skip, limit } for mongoose query
 */
exports.paginate = (page = 1, limit = 10) => {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  
  const skip = (pageNumber - 1) * limitNumber;
  
  return { skip, limit: limitNumber };
};
