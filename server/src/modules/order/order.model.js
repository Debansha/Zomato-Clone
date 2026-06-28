const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References delivery_partner role user
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        customizations: [
          {
            name: String,
            selectedOption: String,
            extraPrice: Number,
          },
        ],
        itemTotal: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 5,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tip: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: String,
    status: {
      type: String,
      enum: [
        'placed',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'on_the_way',
        'delivered',
        'cancelled',
      ],
      default: 'placed',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      default: 'online',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
    },
    estimatedDeliveryTime: Number, // in minutes
    actualDeliveryTime: Date,
    deliveryInstructions: String,
    cancelReason: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryPartner: 1 });

// Pre-save hook
orderSchema.pre('save', function (next) {
  // Generate orderNumber if new
  if (this.isNew) {
    const randomAlphanumeric = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ZMT-${randomAlphanumeric}`;
    
    // Initial status history
    this.statusHistory.push({ status: this.status, note: 'Order placed' });
  }

  // Calculate GST if not set manually (5% of subtotal)
  if (this.isModified('subtotal') && !this.isModified('gstAmount')) {
    this.gstAmount = Math.round(this.subtotal * 0.05);
  }

  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
