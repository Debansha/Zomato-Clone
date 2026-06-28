const Joi = require('joi');

exports.createPaymentOrderSchema = {
  body: Joi.object({
    orderId: Joi.string().required(),
    amount: Joi.number().required(), // Amount in INR
  }),
};

exports.verifyPaymentSchema = {
  body: Joi.object({
    orderId: Joi.string().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};
