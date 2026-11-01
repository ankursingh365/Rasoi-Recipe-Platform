import { Recipe } from '../models/Recipe.js';
import { AppError } from '../utils/AppError.js';
import {
  COURSES,
  DIET_FILTER,
  DIETS,
  EVERYDAY_SPICES,
  REGIONS,
  SORTS,
  STAPLES,
  TAGS,
} from '../utils/constants.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// Only what a recipe card shows. Lists never send the ingredients or steps.
const CARD_FIELDS =
  'title subtitle slug course diet cuisine region tags totalTime servings tone image ratingAvg ratingCount';

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
  const { q, page, limit, sort, course, diet, region, tag, maxTime } = req.valid.query;

  // Build the MongoDB filter from whichever options were sent.
  const filter = {};
  if (course) filter.course = course;
  if (diet) filter.diet = { $in: DIET_FILTER[diet] };
  if (region) filter.region = region;
  if (tag) filter.tags = tag;
  if (maxTime) filter.totalTime = { $lte: maxTime };
  else if (sort === 'quickest') filter.totalTime = { $ne: null }; // can't rank recipes with no time

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
export async function getRecipe(req, res) {
  const recipe = await Recipe.findOne({ slug: req.valid.params.slug }).lean();
  if (!recipe) throw new AppError(404, 'Recipe not found');

  const similar = await findSimilar(recipe);
  res.json({ recipe, similar });
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
    { $project: { ...toProjection(CARD_FIELDS), shared: 1 } },
  ]);
}

// "title slug" -> { title: 1, slug: 1 }, the format $project expects.
function toProjection(fields) {
  return Object.fromEntries(fields.split(' ').map((field) => [field, 1]));
}