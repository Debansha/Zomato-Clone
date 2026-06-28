const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('./payment.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');

// Initialize Razorpay
// For safety, only initialize if keys are present
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

exports.createPaymentOrder = async (userId, orderId, amount) => {
  if (!razorpay) {
    throw ApiError.internal('Payment gateway is not configured');
  }

  // 1. Verify order exists and belongs to user
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentStatus === 'paid') {
    throw ApiError.badRequest('This order is already paid');
  }

  // Verify amount matches order total
  if (Math.abs(order.totalAmount - amount) > 1) { // Allowing 1 rupee diff for rounding
    throw ApiError.badRequest('Amount mismatch');
  }

  // 2. Create Razorpay order (amount is in paise)
  const options = {
    amount: Math.round(amount * 100), // convert INR to paise
    currency: 'INR',
    receipt: `receipt_order_${orderId}`,
    payment_capture: 1, // Auto capture
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);

    // 3. Create Payment document
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      razorpayOrderId: razorpayOrder.id,
      amount: options.amount,
      currency: options.currency,
      status: 'created',
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error('Razorpay Error:', error);
    throw ApiError.internal('Failed to create payment order');
  }
};

exports.verifyPayment = async (paymentData) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

  // 1. Find payment record
  const payment = await Payment.findOne({ razorpayOrderId, order: orderId });
  if (!payment) {
    throw ApiError.notFound('Payment record not found');
  }

  // 2. Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const isAuthentic = generatedSignature === razorpaySignature;

  if (isAuthentic) {
    // 3. Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'captured';
    await payment.save();

    // 4. Update order status
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      paymentId: payment._id,
    });

    return { success: true, payment };
  } else {
    // Payment verification failed
    payment.status = 'failed';
    await payment.save();
    
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
    });

    throw ApiError.badRequest('Invalid payment signature');
  }
};

exports.getPaymentByOrder = async (orderId, userId) => {
  const payment = await Payment.findOne({ order: orderId, user: userId });
  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }
  return payment;
};
