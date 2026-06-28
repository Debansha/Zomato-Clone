/**
 * @fileoverview Async handler wrapper for Express route handlers.
 * Eliminates the need for try-catch blocks in every async controller method.
 */

/**
 * Wraps an async Express route handler to automatically catch errors
 * and forward them to the next error-handling middleware.
 *
 * @param {Function} fn - Async route handler function (req, res, next) => Promise
 * @returns {Function} Express middleware function with error handling
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
