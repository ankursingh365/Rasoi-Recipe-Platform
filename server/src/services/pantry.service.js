import { Recipe } from '../models/Recipe.js';
import { EVERYDAY_SPICES, STAPLES } from '../utils/constants.js';
import { buildRecipeFilter, CARD_PROJECTION } from '../utils/recipeQuery.js';
import { resolveIngredients } from './ingredient.service.js';

// "Cook with what you have": recipes that use your ingredients, ranked by how little
// you'd need to buy. One aggregation pipeline does the matching, ranking and paging.
export async function findPantryMatches({
  have,
  maxMissing,
  staples,
  spices,
  page,
  limit,
  ...options
}) {
  // Turn what was typed ("jeera", "onions") into the keys recipes use ("cumin seeds", "onion").
  const { keys, unknown } = await resolveIngredients(have);
  if (keys.length === 0) {
    return { have: [], unknown, items: [], total: 0, readyToCook: 0, page, limit, totalPages: 0 };
  }

  // What you can assume is in the kitchen: what you listed, plus the basics if you said so.
  const inKitchen = [...keys, ...(staples ? STAPLES : []), ...(spices ? EVERYDAY_SPICES : [])];

  const [result] = await Recipe.aggregate([
    // 1. Recipes that pass the filters and use at least one thing you listed. This stage
    //    can use the ingredientKeys index, so MongoDB never reads most of the 5,909 recipes.
    { $match: { ...buildRecipeFilter(options), ingredientKeys: { $in: keys } } },

    // 2. For each recipe: which of your ingredients it uses, and what you're missing.
    {
      $addFields: {
        using: { $setIntersection: ['$ingredientKeys', keys] },
        missing: { $setDifference: ['$ingredientKeys', inKitchen] },
      },
    },
    { $addFields: { missingCount: { $size: '$missing' }, usingCount: { $size: '$using' } } },

    // 3. Drop recipes that need too much shopping.
    { $match: { missingCount: { $lte: maxMissing } } },

    // 4. Ready-to-cook first (nothing missing), then the fewest missing, then the ones that
    //    use the most of what you have. _id keeps the order the same between pages.
    { $sort: { missingCount: 1, usingCount: -1, ratingCount: -1, _id: 1 } },

    // 5. $facet runs several pipelines over the same results in one go: this page of
    //    recipes, the total count, and how many need nothing at all.
    {
      $facet: {
        items: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { ...CARD_PROJECTION, using: 1, missing: 1, missingCount: 1 } },
        ],
        total: [{ $count: 'count' }],
        ready: [{ $match: { missingCount: 0 } }, { $count: 'count' }],
      },
    },
  ]);

  const total = result.total[0]?.count ?? 0; // $count returns nothing at all when there are 0
  return {
    have: keys, // what we understood, so the app can show "jeera → cumin seeds"
    unknown, // words that aren't in the catalogue
    items: result.items,
    total,
    readyToCook: result.ready[0]?.count ?? 0,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}