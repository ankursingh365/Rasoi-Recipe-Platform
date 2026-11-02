import { z } from 'zod';

const stars = 'Give a rating from 1 to 5';

// PUT /api/recipes/:slug/reviews/mine  { "rating": 5, "comment": "..." }
// The body is JSON, so rating arrives as a real number: no coerce needed.
export const reviewBody = z.object({
  rating: z.number({ error: stars }).int(stars).min(1, stars).max(5, stars),
  comment: z.string().trim().max(1000, 'Keep it under 1,000 characters').default(''),
});

// GET /api/recipes/:slug/reviews?page=2
export const listReviewsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});