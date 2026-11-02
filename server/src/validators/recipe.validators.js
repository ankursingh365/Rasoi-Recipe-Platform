import { z } from 'zod';
import { COURSES, DIETS, REGIONS, SORTS, TAGS } from '../utils/constants.js';

// Everything in a query string arrives as text ("2", not 2), so z.coerce.number()
// converts it. Anything not listed in a schema is ignored.

// Filters and page options that several endpoints share (recipes now, pantry in step 13).
export const recipeFilters = {
  course: z.enum(COURSES).optional(),
  diet: z.enum(DIETS).optional(),
  region: z.enum(REGIONS).optional(),
  tag: z.enum(TAGS).optional(),
  maxTime: z.coerce.number().int().min(1).optional(), // minutes
};

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
};

// GET /api/recipes
export const listRecipesQuery = z.object({
  q: z.string().trim().max(100).optional(), // search words
  sort: z.enum(SORTS).optional(), // no default: it depends on whether you're searching
  ...recipeFilters,
  ...pagination,
});

// GET /api/recipes/:slug. A slug is lowercase words joined by dashes, like "masala-karela".
export const recipeSlugParams = z.object({
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Not a valid recipe address'),
});