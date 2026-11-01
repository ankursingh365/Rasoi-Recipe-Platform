import { Router } from 'express';
import { getFilters, getRecipe, listRecipes } from '../controllers/recipe.controller.js';
import { validate } from '../middleware/validate.js';
import { listRecipesQuery, recipeSlugParams } from '../validators/recipe.validators.js';

const router = Router();

router.get('/', validate('query', listRecipesQuery), listRecipes);
router.get('/filters', getFilters);
// Keep "/:slug" last: it matches any single word, so it would also catch "/filters".
router.get('/:slug', validate('params', recipeSlugParams), getRecipe);

export default router;