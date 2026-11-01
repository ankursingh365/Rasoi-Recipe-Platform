import express from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import apiRoutes from './routes/index.js';

const app = express();

// Middleware runs top to bottom, in the order it's added.

// 1. Log every request: method, URL, status code and how long it took.
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 2. Read JSON request bodies into req.body.
app.use(express.json());

// 3. Every API route lives under /api.
app.use('/api', apiRoutes);

// 4. Nothing matched: answer 404. The error handler always goes last.
app.use(notFound);
app.use(errorHandler);

export default app;