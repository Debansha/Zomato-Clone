const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { defaultLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', defaultLimiter);

// Swagger API Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zomato Clone API',
      version: '1.0.0',
      description: 'API documentation for the Zomato Clone application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

// Import Routes
const authRoutes = require('./modules/auth/auth.routes');
const restaurantRoutes = require('./modules/restaurant/restaurant.routes');
const menuRoutes = require('./modules/menu/menu.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const orderRoutes = require('./modules/order/order.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const reviewRoutes = require('./modules/review/review.routes');
const deliveryRoutes = require('./modules/delivery/delivery.routes');
const searchRoutes = require('./modules/search/search.routes');
const adminRoutes = require('./modules/admin/admin.routes');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Handler for undefined routes
app.all('*', (req, res, next) => {
  next(ApiError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
