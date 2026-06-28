const User = require('./user.model');
const ApiError = require('../../utils/ApiError');
const jwt = require('jsonwebtoken');

exports.register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw ApiError.badRequest('Email is already registered');
  }

  if (userData.phone) {
    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
      throw ApiError.badRequest('Phone number is already registered');
    }
  }

  const user = await User.create(userData);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  user.password = undefined; // Exclude from response

  return { user, accessToken, refreshToken };
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  user.password = undefined; // Exclude from response

  return { user, accessToken, refreshToken };
};

exports.refreshToken = async (token) => {
  if (!token) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });

    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
};

exports.logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

exports.updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

exports.addAddress = async (userId, address) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { addresses: address } },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.addresses;
};

exports.removeAddress = async (userId, addressId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  );
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.addresses;
};
