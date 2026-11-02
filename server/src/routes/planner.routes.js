import { Router } from 'express';
import {
  addMeal,
  getGroceryList,
  getWeek,
  removeMeal,
  updateMeal,
} from '../controllers/planner.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addMealBody,
  mealParams,
  updateMealBody,
  weekParams,
} from '../validators/planner.validators.js';

const router = Router();

// A plan belongs to one user, so every route needs a login.
router.use(requireAuth);

router.get('/:week', validate('params', weekParams), getWeek);
router.get('/:week/grocery', validate('params', weekParams), getGroceryList);
router.post('/:week/meals', validate('params', weekParams), validate('body', addMealBody), addMeal);
router.patch(
  '/:week/meals/:mealId',
  validate('params', mealParams),
  validate('body', updateMealBody),
  updateMeal,
);
router.delete('/:week/meals/:mealId', validate('params', mealParams), removeMeal);

export default router;