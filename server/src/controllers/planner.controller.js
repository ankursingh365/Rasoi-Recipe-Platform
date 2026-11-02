import { Ingredient } from '../models/Ingredient.js';
import { MealPlan } from '../models/MealPlan.js';
import { findRecipeBySlug } from '../services/recipe.service.js';
import { buildGroceryList } from '../services/grocery.service.js';
import { AppError } from '../utils/AppError.js';

// What the planner shows for each recipe.
const MEAL_RECIPE_FIELDS = 'title slug course diet totalTime servings tone image';

// The user's plan for one week, with each meal's recipe filled in. Every query includes
// user: req.user._id, so nobody can read or change someone else's plan.
async function loadWeek(userId, week) {
  const plan = await MealPlan.findOne({ user: userId, week })
    .populate('meals.recipe', MEAL_RECIPE_FIELDS)
    .lean();
  const meals = (plan?.meals ?? []).filter((meal) => meal.recipe); // skip deleted recipes
  return { week, meals };
}

// GET /api/planner/:week
export async function getWeek(req, res) {
  res.json(await loadWeek(req.user._id, req.valid.params.week));
}

// POST /api/planner/:week/meals: add a dish to a day.
export async function addMeal(req, res) {
  const { week } = req.valid.params;
  const { day, slot, recipe: slug, servings } = req.valid.body;
  const recipe = await findRecipeBySlug(slug, '_id servings');

  // $push adds to the list inside the document in one step. upsert creates the week's
  // plan the first time something is added to it.
  await MealPlan.updateOne(
    { user: req.user._id, week },
    { $push: { meals: { day, slot, recipe: recipe._id, servings: servings ?? recipe.servings } } },
    { upsert: true, runValidators: true },
  );

  res.status(201).json(await loadWeek(req.user._id, week));
}

// PATCH /api/planner/:week/meals/:mealId: move a meal, or change how many it serves.
export async function updateMeal(req, res) {
  const { week, mealId } = req.valid.params;

  // { day: 3 } becomes { 'meals.$.day': 3 }. "meals.$" means "the meal in the list that
  // matched the filter", so only that one meal changes.
  const changes = {};
  for (const [field, value] of Object.entries(req.valid.body)) changes[`meals.$.${field}`] = value;

  const result = await MealPlan.updateOne(
    { user: req.user._id, week, 'meals._id': mealId },
    { $set: changes },
    { runValidators: true },
  );
  if (result.matchedCount === 0) throw new AppError(404, 'Meal not found');

  res.json(await loadWeek(req.user._id, week));
}

// DELETE /api/planner/:week/meals/:mealId
export async function removeMeal(req, res) {
  const { week, mealId } = req.valid.params;

  // $pull removes every item in the list that matches, here the one with this _id.
  // The filter only matches a plan that has this meal, so matchedCount says if it was there.
  // (modifiedCount wouldn't work: timestamps change updatedAt on every update.)
  const result = await MealPlan.updateOne(
    { user: req.user._id, week, 'meals._id': mealId },
    { $pull: { meals: { _id: mealId } } },
  );
  if (result.matchedCount === 0) throw new AppError(404, 'Meal not found');

  res.json(await loadWeek(req.user._id, week));
}

// GET /api/planner/:week/grocery: everything the week's meals need, added up.
export async function getGroceryList(req, res) {
  const { week } = req.valid.params;

  const plan = await MealPlan.findOne({ user: req.user._id, week })
    .populate('meals.recipe', 'title servings ingredients')
    .lean();
  const meals = (plan?.meals ?? []).filter((meal) => meal.recipe);

  // Names and aisles for every ingredient involved, in one query.
  const keys = [...new Set(meals.flatMap((meal) => meal.recipe.ingredients.map((i) => i.key)))];
  const catalogue = await Ingredient.find({ key: { $in: keys } })
    .select('key name category')
    .lean();

  res.json({ week, ...buildGroceryList(meals, catalogue, req.user.pantry) });
}