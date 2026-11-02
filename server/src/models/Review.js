import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number' },
    },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
);

// One review per person per recipe: posting again edits the review instead.
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });
// A recipe's reviews, newest first.
reviewSchema.index({ recipe: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);