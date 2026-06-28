const paymentService = require('./payment.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;
  const paymentData = await paymentService.createPaymentOrder(req.user.id, orderId, amount);
  res.status(200).json(ApiResponse.success(paymentData, 'Payment order created'));
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.body);
  res.status(200).json(ApiResponse.success(result, 'Payment verified successfully'));
});

exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByOrder(req.params.orderId, req.user.id);
  res.status(200).json(ApiResponse.success(payment));
});
