const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);

router.get('/restaurants', adminController.getRestaurants);
router.patch('/restaurants/:id/verify', adminController.verifyRestaurant);

router.get('/orders', adminController.getOrders);

router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/cuisines', adminController.getPopularCuisines);

module.exports = router;
