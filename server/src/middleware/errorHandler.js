const ApiError = require('../utils/ApiError');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = ApiError.notFound(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}`;
    error = ApiError.badRequest(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = ApiError.badRequest(message.join(', '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route';
    error = ApiError.unauthorized(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired, please login again';
    error = ApiError.unauthorized(message);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
