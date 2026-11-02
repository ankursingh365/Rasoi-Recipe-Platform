import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import recipeRoutes from './recipe.routes.js';

// Every part of the API is plugged in here. Later steps add the pantry, reviews...
const router = Router();

router.use('/health', healthRoutes);
router.use('/recipes', recipeRoutes);
router.use('/auth', authRoutes);

export default router;