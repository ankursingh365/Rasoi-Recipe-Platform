import { Router } from 'express';
import { searchIngredients } from '../controllers/ingredient.controller.js';
import { validate } from '../middleware/validate.js';
import { searchIngredientsQuery } from '../validators/ingredient.validators.js';

const router = Router();

router.get('/', validate('query', searchIngredientsQuery), searchIngredients);

export default router;