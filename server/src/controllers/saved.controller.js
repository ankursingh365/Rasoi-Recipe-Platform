import { SavedRecipe } from '../models/SavedRecipe.js';
import { findRecipeBySlug } from '../services/recipe.service.js';
import { CARD_FIELDS } from '../utils/recipeQuery.js';

// GET /api/saved?page=1: the logged-in user's saved recipes, most recently saved first.
export async function listSaved(req, res) {
  const { page, limit } = req.valid.query;
  const mine = { user: req.user._id };

  const [saved, total] = await Promise.all([
    SavedRecipe.find(mine)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      // populate swaps each recipe id for the recipe's card fields, with one extra query.
      .populate('recipe', CARD_FIELDS)
      .lean(),
    SavedRecipe.countDocuments(mine),
  ]);

  const items = saved
    .filter((entry) => entry.recipe) // skip recipes that were deleted after being saved
    .map((entry) => ({ ...entry.recipe, savedAt: entry.createdAt }));

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
}

// PUT /api/saved/:slug: save a recipe. Saving it again changes nothing.
export async function saveRecipe(req, res) {
  const recipe = await findRecipeBySlug(req.valid.params.slug, '_id');

  // An "upsert": update the matching document, or insert it if there isn't one.
  // $setOnInsert only applies when inserting, so saving twice keeps the first "saved at".
  await SavedRecipe.updateOne(
    { user: req.user._id, recipe: recipe._id },
    { $setOnInsert: { user: req.user._id, recipe: recipe._id } },
    { upsert: true },
  );

  res.json({ saved: true });
}

// DELETE /api/saved/:slug: un-save a recipe. Un-saving one that isn't saved is fine too.
export async function unsaveRecipe(req, res) {
  const recipe = await findRecipeBySlug(req.valid.params.slug, '_id');
  await SavedRecipe.deleteOne({ user: req.user._id, recipe: recipe._id });
  res.json({ saved: false });
}