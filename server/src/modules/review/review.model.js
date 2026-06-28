const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, order: 1 }, { unique: true }); // One review per order per user

// Static method to update restaurant's average rating
reviewSchema.statics.updateRestaurantRating = async function (restaurantId) {
  const stats = await this.aggregate([
    {
      $match: { restaurant: restaurantId },
    },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
        avgRating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
  }
};

// Call updateRestaurantRating after save
reviewSchema.post('save', async function () {
  await this.constructor.updateRestaurantRating(this.restaurant);
});

// Call updateRestaurantRating after remove/delete
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.updateRestaurantRating(doc.restaurant);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
