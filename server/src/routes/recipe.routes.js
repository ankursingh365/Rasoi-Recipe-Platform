import { Router } from 'express';
import { getFilters, getRecipe, listRecipes } from '../controllers/recipe.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listRecipesQuery, recipeSlugParams } from '../validators/recipe.validators.js';
import reviewRoutes from './review.routes.js';

const router = Router();

router.get('/', validate('query', listRecipesQuery), listRecipes);
router.get('/filters', getFilters);
// Keep the "/:slug" routes last: they match any single word, so they would catch "/filters".
router.use('/:slug/reviews', reviewRoutes);
router.get('/:slug', optionalAuth, validate('params', recipeSlugParams), getRecipe);

export default router;