import { Router } from 'express';
import { listSaved, saveRecipe, unsaveRecipe } from '../controllers/saved.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recipeSlugParams } from '../validators/recipe.validators.js';
import { listSavedQuery } from '../validators/saved.validators.js';

const router = Router();

// Everything here belongs to one user, so every route needs a login.
router.use(requireAuth);

router.get('/', validate('query', listSavedQuery), listSaved);
router.put('/:slug', validate('params', recipeSlugParams), saveRecipe);
router.delete('/:slug', validate('params', recipeSlugParams), unsaveRecipe);

export default router;