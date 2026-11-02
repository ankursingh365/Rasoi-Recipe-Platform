import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import ingredientRoutes from './ingredient.routes.js';
import pantryRoutes from './pantry.routes.js';
import plannerRoutes from './planner.routes.js';
import recipeRoutes from './recipe.routes.js';
import savedRoutes from './saved.routes.js';

// Every part of the API is plugged in here.
const router = Router();

router.use('/health', healthRoutes);
router.use('/recipes', recipeRoutes);
router.use('/auth', authRoutes);
router.use('/pantry', pantryRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/saved', savedRoutes);
router.use('/planner', plannerRoutes);

export default router;