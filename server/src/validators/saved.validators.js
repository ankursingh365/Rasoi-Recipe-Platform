import { z } from 'zod';
import { pagination } from './recipe.validators.js';

// GET /api/saved?page=2
export const listSavedQuery = z.object(pagination);