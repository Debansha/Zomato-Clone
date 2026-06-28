const mongoose = require('mongoose');
const slugify = require('slugify');
const { Schema } = mongoose;

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

/**
 * GeoJSON Point schema for restaurant geolocation.
 * Coordinates stored as [longitude, latitude] per GeoJSON spec.
 */
const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: [true, 'Location coordinates are required'],
    },
  },
  { _id: false }
);

/**
 * Image sub-schema – reusable for cover images and gallery.
 */
const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Operating hours sub-schema.
 */
const operatingHoursSchema = new Schema(
  {
    open: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Open time must be in HH:mm format'],
    },
    close: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Close time must be in HH:mm format'],
    },
    days: {
      type: [Number],
      validate: {
        validator: function (arr) {
          return arr.every((d) => d >= 0 && d <= 6);
        },
        message: 'Days must be between 0 (Sunday) and 6 (Saturday)',
      },
      default: [0, 1, 2, 3, 4, 5, 6], // open every day by default
    },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Main Restaurant Schema
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} RestaurantDocument
 * @property {ObjectId} owner            – Reference to the restaurant owner (User)
 * @property {string}   name             – Restaurant display name
 * @property {string}   slug             – URL-friendly unique identifier
 * @property {string}   description      – Short description (max 500 chars)
 * @property {string[]} cuisines         – List of cuisine types served
 * @property {Object}   address          – Physical address
 * @property {Object}   location         – GeoJSON Point (2dsphere indexed)
 * @property {Array}    images           – Gallery images
 * @property {Object}   coverImage       – Primary cover image
 * @property {Object}   operatingHours   – Opening/closing schedule
 * @property {number}   avgRating        – Aggregated average rating (0-5)
 * @property {number}   totalReviews     – Total number of reviews
 * @property {number}   totalOrders      – Lifetime order count
 * @property {number}   priceRange       – 1 (budget) to 4 (fine dining)
 * @property {boolean}  isVeg            – Pure vegetarian flag
 * @property {boolean}  isVerified       – Admin-verified flag
 * @property {boolean}  isActive         – Soft-delete / pause flag
 * @property {number}   preparationTime  – Average prep time in minutes
 * @property {number}   deliveryRadius   – Max delivery distance in km
 * @property {number}   minimumOrder     – Minimum order value (₹)
 * @property {number}   deliveryFee      – Flat delivery fee (₹)
 * @property {string[]} tags             – Searchable tags (trending, promoted, etc.)
 */
const restaurantSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Restaurant must have an owner'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    cuisines: {
      type: [String],
      required: [true, 'At least one cuisine type is required'],
      validate: {
        validator: function (arr) {
          return arr && arr.length >= 1;
        },
        message: 'At least one cuisine type is required',
      },
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    location: {
      type: pointSchema,
      required: [true, 'Restaurant location is required'],
    },

    images: {
      type: [imageSchema],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'A restaurant can have a maximum of 10 gallery images',
      },
    },

    coverImage: {
      url: { type: String },
      publicId: { type: String },
    },

    operatingHours: {
      type: operatingHoursSchema,
      default: () => ({ open: '09:00', close: '23:00', days: [0, 1, 2, 3, 4, 5, 6] }),
    },

    avgRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    priceRange: {
      type: Number,
      enum: {
        values: [1, 2, 3, 4],
        message: 'Price range must be between 1 (budget) and 4 (fine dining)',
      },
      default: 2,
    },

    isVeg: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    preparationTime: {
      type: Number,
      default: 30,
      min: [5, 'Preparation time must be at least 5 minutes'],
    },

    deliveryRadius: {
      type: Number,
      default: 10,
      min: [1, 'Delivery radius must be at least 1 km'],
      max: [50, 'Delivery radius cannot exceed 50 km'],
    },

    minimumOrder: {
      type: Number,
      default: 100,
      min: [0, 'Minimum order value cannot be negative'],
    },

    deliveryFee: {
      type: Number,
      default: 30,
      min: [0, 'Delivery fee cannot be negative'],
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ slug: 1 }, { unique: true });
restaurantSchema.index({ cuisines: 1 });

// ---------------------------------------------------------------------------
// Pre-save Hook – auto-generate slug from name
// ---------------------------------------------------------------------------

/**
 * Generates a URL-safe slug from the restaurant name.
 * Appends a short random suffix to guarantee uniqueness when names collide.
 */
restaurantSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('name')) return next();

    // Base slug from the name
    let baseSlug = slugify(this.name, {
      lower: true,
      strict: true,   // strip special characters
      trim: true,
    });

    // Check for existing slugs that start with the same base
    const existingCount = await mongoose
      .model('Restaurant')
      .countDocuments({ slug: new RegExp(`^${baseSlug}`) });

    // Append a numeric suffix if a collision exists
    this.slug = existingCount > 0 ? `${baseSlug}-${existingCount}` : baseSlug;

    return next();
  } catch (error) {
    return next(error);
  }
});

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------

/**
 * Virtual property that returns `true` if the restaurant is currently open
 * based on its operatingHours settings and the current server time (IST).
 */
restaurantSchema.virtual('isOpen').get(function () {
  if (!this.operatingHours || !this.operatingHours.open || !this.operatingHours.close) {
    return false;
  }

  // Current time in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const currentDay = istDate.getUTCDay(); // 0 = Sunday
  const currentHours = istDate.getUTCHours();
  const currentMinutes = istDate.getUTCMinutes();
  const currentTime = currentHours * 60 + currentMinutes; // minutes since midnight

  // Check if today is an operating day
  if (!this.operatingHours.days.includes(currentDay)) {
    return false;
  }

  // Parse open / close times
  const [openH, openM] = this.operatingHours.open.split(':').map(Number);
  const [closeH, closeM] = this.operatingHours.close.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  // Handle overnight hours (e.g. open 18:00, close 02:00)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }

  return currentTime >= openTime && currentTime <= closeTime;
});

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------

/**
 * Find restaurants near a given location within a maximum distance.
 *
 * @param {number} lng            – Longitude of the search point.
 * @param {number} lat            – Latitude of the search point.
 * @param {number} maxDistanceKm  – Maximum distance in kilometres (default 10).
 * @returns {Promise<Array>}      – Array of matching restaurant documents with a `distance` field.
 */
restaurantSchema.statics.findNearby = function (lng, lat, maxDistanceKm = 10) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',          // metres
        maxDistance: maxDistanceKm * 1000,   // convert km → m
        spherical: true,
      },
    },
    {
      $match: {
        isActive: true,
        isVerified: true,
      },
    },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] },
      },
    },
    {
      $sort: { distance: 1 },
    },
  ]);
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
