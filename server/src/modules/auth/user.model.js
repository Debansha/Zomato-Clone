const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

/**
 * GeoJSON Point sub-schema used for address geolocation.
 * Stored as [longitude, latitude] per the GeoJSON spec.
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
      default: undefined,
    },
  },
  { _id: false }
);

/**
 * Address sub-schema – each user can store multiple saved addresses.
 */
const addressSchema = new Schema(
  {
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    location: {
      type: pointSchema,
    },
  },
  { _id: true } // each address gets its own _id for targeted updates
);

// ---------------------------------------------------------------------------
// Main User Schema
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} UserDocument
 * @property {string}  name         – Display name (2-50 chars)
 * @property {string}  email        – Unique, lowercase, validated
 * @property {string}  password     – Hashed; excluded from queries by default
 * @property {string}  [phone]      – Optional unique phone number
 * @property {string}  role         – One of customer | restaurant_owner | delivery_partner | admin
 * @property {Object}  avatar       – Cloudinary image reference
 * @property {Array}   addresses    – Saved delivery addresses
 * @property {string}  refreshToken – JWT refresh token (excluded from queries by default)
 * @property {boolean} isActive     – Soft-delete flag
 * @property {Date}    lastLogin    – Timestamp of most recent login
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned unless explicitly selected
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },

    role: {
      type: String,
      enum: {
        values: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'customer',
    },

    avatar: {
      url: { type: String },
      publicId: { type: String },
    },

    addresses: {
      type: [addressSchema],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'A user can save a maximum of 10 addresses',
      },
    },

    refreshToken: {
      type: String,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
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

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// ---------------------------------------------------------------------------
// Pre-save Hook – hash password when modified
// ---------------------------------------------------------------------------

/**
 * Hash the user's password with bcryptjs (12 salt rounds) whenever the
 * password field has been created or modified.
 */
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

/**
 * Compare a plaintext candidate password against the stored hash.
 * @param {string} candidatePassword - The plaintext password to verify.
 * @returns {Promise<boolean>} true if the password matches.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // `this.password` may not be selected – caller must .select('+password')
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate a short-lived JWT access token containing user id and role.
 * @returns {string} Signed JWT access token.
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    }
  );
};

/**
 * Generate a long-lived JWT refresh token containing only the user id.
 * @returns {string} Signed JWT refresh token.
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    }
  );
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const User = mongoose.model('User', userSchema);

module.exports = User;
