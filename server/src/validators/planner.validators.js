import { z } from 'zod';
import { MEAL_SLOTS } from '../utils/constants.js';
import { recipeSlugParams } from './recipe.validators.js';

// A week is named by the Monday it starts on, as "YYYY-MM-DD". The app always sends it,
// because "this week" depends on the user's time zone, which the server doesn't know.
const week = z.iso
  .date('Use a date like 2026-11-02')
  .refine(
    (date) => new Date(`${date}T00:00:00Z`).getUTCDay() === 1, // 0 is Sunday, 1 is Monday
    'Use the Monday that starts the week',
  );

const day = z.number().int().min(0, 'Use 0 (Monday) to 6 (Sunday)').max(6, 'Use 0 to 6');
const slot = z.enum(MEAL_SLOTS);
const servings = z.number().int().min(1).max(50);

// /api/planner/:week
export const weekParams = z.object({ week });

// /api/planner/:week/meals/:mealId. MongoDB ids are 24 hexadecimal characters.
export const mealParams = z.object({
  week,
  mealId: z.string().regex(/^[a-f0-9]{24}$/, 'Not a valid meal id'),
});

// POST /api/planner/:week/meals  { "day": 0, "slot": "dinner", "recipe": "paneer-butter-masala" }
export const addMealBody = z.object({
  day,
  slot,
  recipe: recipeSlugParams.shape.slug, // the same slug rule the recipe routes use
  servings: servings.optional(), // leave it out to cook the recipe as written
});

// PATCH /api/planner/:week/meals/:mealId  { "day": 3 } or { "servings": 4 } or both
export const updateMealBody = z
  .object({ day: day.optional(), slot: slot.optional(), servings: servings.optional() })
  .refine((body) => Object.keys(body).length > 0, 'Send a day, slot or servings to change');