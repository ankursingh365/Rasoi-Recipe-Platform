import { z } from 'zod';

// GET /api/ingredients?q=jee
export const searchIngredientsQuery = z.object({
  q: z.string({ error: 'Type part of an ingredient name' }).trim().toLowerCase().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});