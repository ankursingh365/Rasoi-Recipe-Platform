import { z } from 'zod';
import { pagination, recipeFilters } from './recipe.validators.js';

// One ingredient as typed: "  Jeera " -> "jeera".
const ingredientWord = z.string().trim().toLowerCase().min(1).max(60);

// GET /api/pantry/recipes?have=onion,tomato,paneer&maxMissing=2&staples=true
export const pantryQuery = z.object({
  // "Onion, tomato,,onion" -> ['onion', 'tomato']: split on commas, tidy, drop blanks and repeats.
  have: z
    .string({ error: 'Add at least one ingredient' })
    .transform((text) => [
      ...new Set(
        text
          .split(',')
          .map((key) => key.trim().toLowerCase())
          .filter(Boolean),
      ),
    ])
    .pipe(z.array(ingredientWord).min(1, 'Add at least one ingredient').max(50, 'Up to 50 items')),
  // How many ingredients a recipe may need that you don't have.
  maxMissing: z.coerce.number().int().min(0).max(10).default(3),
  // Assume salt, water and oil (staples) and the everyday spice box (spices)?
  // z.stringbool() reads "true"/"false" properly. z.coerce.boolean() would turn "false" into
  // true, because any non-empty text counts as true in JavaScript.
  staples: z.stringbool().default(true),
  spices: z.stringbool().default(true),
  ...recipeFilters,
  ...pagination,
});

// PUT /api/pantry  { "items": ["onion", "jeera", "dahi"] }
export const pantryBody = z.object({
  items: z.array(ingredientWord, { error: 'Send a list of ingredients' }).max(100, 'Up to 100'),
});