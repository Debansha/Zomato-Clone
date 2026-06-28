const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true, // Amount in paise (1 INR = 100 paise)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String, // 'upi', 'card', 'netbanking', 'wallet'
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ order: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
