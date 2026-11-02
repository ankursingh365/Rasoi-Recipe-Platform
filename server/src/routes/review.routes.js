import { Router } from 'express';
import { deleteMyReview, listReviews, saveMyReview } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recipeSlugParams } from '../validators/recipe.validators.js';
import { listReviewsQuery, reviewBody } from '../validators/review.validators.js';

// This router is plugged in at /recipes/:slug/reviews. mergeParams lets its routes
// see :slug, which belongs to the parent path.
const router = Router({ mergeParams: true });

router.use(validate('params', recipeSlugParams));

router.get('/', validate('query', listReviewsQuery), listReviews);
router.put('/mine', requireAuth, validate('body', reviewBody), saveMyReview);
router.delete('/mine', requireAuth, deleteMyReview);

export default router;