/**
 * @fileoverview Standardized API response wrapper.
 * Provides a consistent JSON structure for all API responses.
 */

class ApiResponse {
  /**
   * Create a standardized API response.
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable response message
   * @param {*} [data=null] - Response payload
   */
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * Send this response via Express res object.
   * @param {import('express').Response} res - Express response object
   * @returns {import('express').Response}
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

module.exports = ApiResponse;
