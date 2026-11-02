import { Recipe } from '../models/Recipe.js';
import { Review } from '../models/Review.js';

// Note: unlike find(), aggregate() doesn't convert text into ObjectIds for you, so
// recipeId must already be an ObjectId (recipe._id is).

// Recalculates a recipe's average rating and review count from its reviews, and stores them
// on the recipe (the ratingAvg and ratingCount fields from step 6), so lists can sort by them.
export async function refreshRating(recipeId) {
  const [stats] = await Review.aggregate([
    { $match: { recipe: recipeId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const ratingAvg = stats ? Math.round(stats.average * 10) / 10 : 0; // one decimal: 4.3
  const ratingCount = stats?.count ?? 0;
  await Recipe.updateOne({ _id: recipeId }, { $set: { ratingAvg, ratingCount } });
  return { ratingAvg, ratingCount };
}

// How many reviews gave each number of stars: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 }.
export async function ratingBreakdown(recipeId) {
  const groups = await Review.aggregate([
    { $match: { recipe: recipeId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const group of groups) breakdown[group._id] = group.count;
  return breakdown;
}