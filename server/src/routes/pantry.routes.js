import { Router } from 'express';
import { getMyPantry, getPantryRecipes, saveMyPantry } from '../controllers/pantry.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pantryBody, pantryQuery } from '../validators/pantry.validators.js';

const router = Router();

// Anyone can search by pantry. Saving one needs an account.
router.get('/recipes', validate('query', pantryQuery), getPantryRecipes);
router.get('/', requireAuth, getMyPantry);
router.put('/', requireAuth, validate('body', pantryBody), saveMyPantry);

export default router;