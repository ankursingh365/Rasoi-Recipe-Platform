import { Recipe } from '../models/Recipe.js';
import { AppError } from '../utils/AppError.js';

// Finds a recipe by its slug or answers 404. Used by every route under /recipes/:slug.
// `fields` picks what to load: '_id' is enough when you only need to point at the recipe.
export async function findRecipeBySlug(slug, fields) {
  const recipe = await Recipe.findOne({ slug }).select(fields).lean();
  if (!recipe) throw new AppError(404, 'Recipe not found');
  return recipe;
}