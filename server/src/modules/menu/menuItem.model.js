const mongoose = require('mongoose');
const { Schema } = mongoose;

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

/**
 * Customization option – represents a single selectable choice
 * within a customization group (e.g. "Large" under "Size").
 */
const customizationOptionSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, 'Option label is required'],
      trim: true,
    },
    extraPrice: {
      type: Number,
      default: 0,
      min: [0, 'Extra price cannot be negative'],
    },
  },
  { _id: false }
);

/**
 * Customization group – a named set of options that the customer can
 * choose from when ordering this menu item (e.g. "Size", "Toppings").
 */
const customizationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Customization name is required'],
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [customizationOptionSchema],
      validate: {
        validator: function (arr) {
          return arr && arr.length >= 1;
        },
        message: 'At least one customization option is required',
      },
    },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Main MenuItem Schema
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} MenuItemDocument
 * @property {ObjectId} restaurant      – Owning restaurant reference
 * @property {string}   name            – Dish name
 * @property {string}   description     – Short dish description
 * @property {number}   price           – Base price in ₹
 * @property {string}   category        – Menu section / category
 * @property {Object}   image           – Cloudinary image reference
 * @property {boolean}  isVeg           – Vegetarian indicator (green/red dot)
 * @property {boolean}  isAvailable     – Whether currently in stock
 * @property {boolean}  isBestseller    – Bestseller badge flag
 * @property {number}   spiceLevel      – 0 (none) to 3 (extra hot)
 * @property {number}   preparationTime – Estimated prep time in minutes
 * @property {Array}    customizations  – Add-on / variant groups
 * @property {number}   orderCount      – Lifetime order tally (for popularity sorting)
 */
const menuItemSchema = new Schema(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Menu item must belong to a restaurant'],
    },

    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      maxlength: [100, 'Dish name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'recommended',
          'starters',
          'main_course',
          'breads',
          'rice',
          'desserts',
          'beverages',
          'combos',
          'sides',
        ],
        message: '{VALUE} is not a valid menu category',
      },
    },

    image: {
      url: { type: String },
      publicId: { type: String },
    },

    isVeg: {
      type: Boolean,
      required: [true, 'Veg/Non-veg classification is required'],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    spiceLevel: {
      type: Number,
      enum: {
        values: [0, 1, 2, 3],
        message: 'Spice level must be between 0 (none) and 3 (extra hot)',
      },
      default: 1,
    },

    preparationTime: {
      type: Number,
      min: [1, 'Preparation time must be at least 1 minute'],
    },

    customizations: {
      type: [customizationSchema],
      default: [],
    },

    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Compound Indexes – optimised for common query patterns
// ---------------------------------------------------------------------------

// Fetch all items of a category for a specific restaurant
menuItemSchema.index({ restaurant: 1, category: 1 });

// Fetch only available items for a restaurant (menu page rendering)
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
