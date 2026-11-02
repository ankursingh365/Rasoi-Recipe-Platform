import { Recipe } from '../models/Recipe.js';
import { Review } from '../models/Review.js';
import { SavedRecipe } from '../models/SavedRecipe.js';
import { findRecipeBySlug } from '../services/recipe.service.js';
import {
  COURSES,
  DIETS,
  EVERYDAY_SPICES,
  REGIONS,
  SORTS,
  STAPLES,
  TAGS,
} from '../utils/constants.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildRecipeFilter, CARD_FIELDS, CARD_PROJECTION } from '../utils/recipeQuery.js';

// _id comes last in every sort as a tie-breaker, so the order is always the same.
// Without it, recipes with equal values could swap places between pages.
const SORT_ORDERS = {
  relevance: { score: { $meta: 'textScore' }, _id: 1 }, // best text-search match first
  popular: { ratingCount: -1, ratingAvg: -1, _id: 1 },
  quickest: { totalTime: 1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  az: { title: 1, _id: 1 },
};

// GET /api/recipes?q=paneer&course=Main Course&diet=vegetarian&maxTime=30&sort=quickest&page=2
export async function listRecipes(req, res) {
  const { q, page, limit, sort, ...options } = req.valid.query;

  // Build the MongoDB filter from whichever options were sent.
  const filter = buildRecipeFilter(options);
  if (sort === 'quickest' && !options.maxTime) filter.totalTime = { $ne: null }; // no time, no rank

  // Search with the text index first: it matches whole words and scores each recipe.
  // If that finds nothing (say, a half-typed "panee"), look for the letters inside titles.
  if (q) {
    filter.$text = { $search: q };
    if ((await Recipe.countDocuments(filter)) === 0) {
      delete filter.$text;
      filter.title = { $regex: escapeRegex(q), $options: 'i' }; // i = ignore upper/lower case
    }
  }

  // Searches show the best matches first, but that order only exists when $text was used.
  let order = sort ?? (q ? 'relevance' : 'popular');
  if (order === 'relevance' && !filter.$text) order = 'popular';

  // Run the page query and the count at the same time instead of one after the other.
  const [items, total] = await Promise.all([
    Recipe.find(filter)
      .sort(SORT_ORDERS[order])
      .skip((page - 1) * limit)
      .limit(limit)
      .select(CARD_FIELDS)
      .lean(),
    Recipe.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
}

// GET /api/recipes/filters: the allowed values, so the app can build its filter menus.
export function getFilters(req, res) {
  res.json({ courses: COURSES, diets: DIETS, regions: REGIONS, tags: TAGS, sorts: SORTS });
}

// GET /api/recipes/:slug: one recipe with everything in it, plus similar dishes.
// Logged-in users also learn whether they saved it, and see their own review.
export async function getRecipe(req, res) {
  const recipe = await findRecipeBySlug(req.valid.params.slug);
  const mine = req.user && { user: req.user._id, recipe: recipe._id };

  const [similar, saved, myReview] = await Promise.all([
    findSimilar(recipe),
    mine ? SavedRecipe.exists(mine) : null,
    mine ? Review.findOne(mine).select('rating comment').lean() : null,
  ]);

  res.json({ recipe, similar, saved: Boolean(saved), myReview });
}

// Salt, oil and the everyday spices are in almost everything, so they don't count.
const COMMON = [...STAPLES, ...EVERYDAY_SPICES];

// Recipes of the same course with the most similar ingredients. "Similar" is the Jaccard
// similarity of the two ingredient sets: shared ingredients / all ingredients in either.
async function findSimilar(recipe) {
  const mainKeys = recipe.ingredientKeys.filter((key) => !COMMON.includes(key));
  if (mainKeys.length === 0) return [];

  // An aggregation pipeline: each stage takes the documents from the stage before it.
  return Recipe.aggregate([
    // 1. Keep other recipes of the same course that share at least one main ingredient.
    {
      $match: {
        _id: { $ne: recipe._id },
        course: recipe.course,
        ingredientKeys: { $in: mainKeys },
      },
    },
    // 2. Count the shared main ingredients, and the other recipe's own main ingredients.
    {
      $addFields: {
        shared: { $size: { $setIntersection: ['$ingredientKeys', mainKeys] } },
        theirs: { $size: { $setDifference: ['$ingredientKeys', COMMON] } },
      },
    },
    // 3. Jaccard similarity = shared / (mine + theirs - shared). 1 means identical.
    {
      $addFields: {
        similarity: {
          $divide: ['$shared', { $subtract: [{ $add: [mainKeys.length, '$theirs'] }, '$shared'] }],
        },
      },
    },
    // 4. Most similar first, and keep six.
    { $sort: { similarity: -1, ratingCount: -1, _id: 1 } },
    { $limit: 6 },
    // 5. Send card fields only, plus how many ingredients they share.
    { $project: { ...CARD_PROJECTION, shared: 1 } },
  ]);
}