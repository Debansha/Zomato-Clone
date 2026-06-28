/**
 * @module utils/ApiError
 * @description Custom API error class for consistent, operational error handling.
 * Extends the native Error class with HTTP status codes, structured error arrays,
 * and convenient static factory methods.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (4xx / 5xx).
   * @param {string} message    - Human-readable error message.
   * @param {Array}  [errors=[]] - Optional array of field-level error details.
   * @param {boolean} [isOperational=true] - Marks whether the error is expected (operational)
   *   vs. a programming bug. Operational errors are safe to expose to clients.
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Capture a clean stack trace (omits the constructor frame)
    Error.captureStackTrace(this, this.constructor);
  }

  // -----------------------------------------------------------------------
  // Static factory methods
  // -----------------------------------------------------------------------

  /**
   * 400 Bad Request
   * @param {string} [msg='Bad request']
   * @param {Array}  [errors=[]]
   * @returns {ApiError}
   */
  static badRequest(msg = 'Bad request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  /**
   * 401 Unauthorized
   * @param {string} [msg='Unauthorized — please log in']
   * @returns {ApiError}
   */
  static unauthorized(msg = 'Unauthorized — please log in') {
    return new ApiError(401, msg);
  }

  /**
   * 403 Forbidden
   * @param {string} [msg='Forbidden — insufficient permissions']
   * @returns {ApiError}
   */
  static forbidden(msg = 'Forbidden — insufficient permissions') {
    return new ApiError(403, msg);
  }

  /**
   * 404 Not Found
   * @param {string} [msg='Resource not found']
   * @returns {ApiError}
   */
  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  /**
   * 409 Conflict
   * @param {string} [msg='Resource already exists']
   * @returns {ApiError}
   */
  static conflict(msg = 'Resource already exists') {
    return new ApiError(409, msg);
  }

  /**
   * 429 Too Many Requests
   * @param {string} [msg='Too many requests — please try again later']
   * @returns {ApiError}
   */
  static tooMany(msg = 'Too many requests — please try again later') {
    return new ApiError(429, msg);
  }

  /**
   * 500 Internal Server Error
   * @param {string} [msg='Internal server error']
   * @returns {ApiError}
   */
  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg, [], false);
  }
}

module.exports = ApiError;
