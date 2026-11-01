import { Router } from 'express';
import healthRoutes from './health.routes.js';
import recipeRoutes from './recipe.routes.js';

// Every part of the API is plugged in here. Later steps add auth, pantry, reviews...
const router = Router();

router.use('/health', healthRoutes);
router.use('/recipes', recipeRoutes);

export default router;