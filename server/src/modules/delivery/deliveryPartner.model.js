const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'motorcycle', 'scooter', 'car'],
      default: 'motorcycle',
    },
    vehicleNumber: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ isAvailable: 1, isOnline: 1 });

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
module.exports = DeliveryPartner;
