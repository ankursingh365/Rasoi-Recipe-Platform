import { Router } from 'express';
import healthRoutes from './health.routes.js';

// Every part of the API is plugged in here. Later steps add recipes, auth, pantry...
const router = Router();

router.use('/health', healthRoutes);

export default router;