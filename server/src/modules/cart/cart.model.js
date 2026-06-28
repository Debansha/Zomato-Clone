const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        name: {
          type: String,
        },
        price: {
          type: Number,
        },
        quantity: {
          type: Number,
          min: 1,
          max: 20,
          default: 1,
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
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate totalAmount and totalItems
cartSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  } else {
    this.totalAmount = 0;
    this.totalItems = 0;
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
