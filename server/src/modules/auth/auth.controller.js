const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  res.cookie('refreshToken', token, cookieOptions);
};

exports.register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setTokenCookie(res, refreshToken);
  res.status(201).json(ApiResponse.created({ user, accessToken }, 'User registered successfully'));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  setTokenCookie(res, refreshToken);
  res.status(200).json(ApiResponse.success({ user, accessToken }, 'Login successful'));
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshToken(token);
  setTokenCookie(res, refreshToken);
  res.status(200).json(ApiResponse.success({ accessToken }, 'Token refreshed successfully'));
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json(ApiResponse.success(null, 'Logout successful'));
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(ApiResponse.success(user));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.status(200).json(ApiResponse.success(user, 'Profile updated successfully'));
});

exports.addAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.addAddress(req.user.id, req.body);
  res.status(200).json(ApiResponse.success(addresses, 'Address added successfully'));
});

exports.removeAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.removeAddress(req.user.id, req.params.addressId);
  res.status(200).json(ApiResponse.success(addresses, 'Address removed successfully'));
});
