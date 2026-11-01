import { z } from 'zod';
import { COURSES, DIETS, REGIONS, SORTS, TAGS } from '../utils/constants.js';

// GET /api/recipes. Everything in a query string arrives as text ("2", not 2),
// so z.coerce.number() converts it. Anything not listed here is ignored.
export const listRecipesQuery = z.object({
  q: z.string().trim().max(100).optional(), // search words
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  sort: z.enum(SORTS).optional(), // no default: it depends on whether you're searching
  course: z.enum(COURSES).optional(),
  diet: z.enum(DIETS).optional(),
  region: z.enum(REGIONS).optional(),
  tag: z.enum(TAGS).optional(),
  maxTime: z.coerce.number().int().min(1).optional(), // minutes
});

// GET /api/recipes/:slug. A slug is lowercase words joined by dashes, like "masala-karela".
export const recipeSlugParams = z.object({
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Not a valid recipe address'),
});