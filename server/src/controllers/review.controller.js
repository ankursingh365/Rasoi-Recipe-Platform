import { Review } from '../models/Review.js';
import { findRecipeBySlug } from '../services/recipe.service.js';
import { ratingBreakdown, refreshRating } from '../services/review.service.js';

// GET /api/recipes/:slug/reviews: newest first, with the star breakdown for the rating bars.
export async function listReviews(req, res) {
  const recipe = await findRecipeBySlug(req.valid.params.slug, '_id ratingAvg ratingCount');
  const { page, limit } = req.valid.query;
  const ofThisRecipe = { recipe: recipe._id };

  const [items, total, breakdown] = await Promise.all([
    Review.find(ofThisRecipe)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('rating comment createdAt updatedAt user')
      .populate('user', 'name') // only the reviewer's name: never send other people's emails
      .lean(),
    Review.countDocuments(ofThisRecipe),
    ratingBreakdown(recipe._id),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    ratingAvg: recipe.ratingAvg,
    ratingCount: recipe.ratingCount,
    breakdown,
  });
}

// PUT /api/recipes/:slug/reviews/mine: write your review, or change the one you wrote.
export async function saveMyReview(req, res) {
  const recipe = await findRecipeBySlug(req.valid.params.slug, '_id');
  const { rating, comment } = req.valid.body;

  // Another upsert: one review per person per recipe, created the first time, then updated.
  // runValidators makes Mongoose check the schema rules here too, as it does on create().
  const review = await Review.findOneAndUpdate(
    { recipe: recipe._id, user: req.user._id },
    { $set: { rating, comment } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  ).lean();

  const { ratingAvg, ratingCount } = await refreshRating(recipe._id);
  res.json({ review, ratingAvg, ratingCount });
}

// DELETE /api/recipes/:slug/reviews/mine
export async function deleteMyReview(req, res) {
  const recipe = await findRecipeBySlug(req.valid.params.slug, '_id');
  await Review.deleteOne({ recipe: recipe._id, user: req.user._id });

  const { ratingAvg, ratingCount } = await refreshRating(recipe._id);
  res.json({ deleted: true, ratingAvg, ratingCount });
}