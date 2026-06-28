const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addAddressSchema,
} = require('./auth.validation');

// Public routes (rate limited)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/update-profile', validate(updateProfileSchema), authController.updateProfile);
router.post('/address', validate(addAddressSchema), authController.addAddress);
router.delete('/address/:addressId', authController.removeAddress);

module.exports = router;
