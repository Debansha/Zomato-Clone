/**
 * @fileoverview Authentication and authorization middleware.
 * Verifies JWT access tokens and enforces role-based access control.
 */

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../modules/auth/user.model');

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Extracts the token from the Authorization header, verifies it,
 * and attaches the user document to req.user.
 *
 * @type {import('express').RequestHandler}
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired. Please refresh your token.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token. Please log in again.');
    }
    throw ApiError.unauthorized('Authentication failed.');
  }
});

/**
 * Middleware factory to authorize requests based on user roles.
 * Must be used after the `authenticate` middleware.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'restaurant_owner')
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/restaurants', authenticate, authorize('restaurant_owner', 'admin'), createRestaurant);
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required before authorization.');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };
