import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';
import apiRoutes from './routes/index.js';

const app = express();

// On Render, every request reaches the app through Render's proxy. This tells Express
// to read the visitor's real IP address from the proxy's X-Forwarded-For header.
// Without it, every visitor would share one IP address, and one rate limit.
if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

// Middleware runs top to bottom, in the order it's added.

// 1. Security headers on every response (and no "X-Powered-By: Express").
app.use(helmet());

// 2. Log every request: method, URL, status code and how long it took.
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 3. Read JSON request bodies (up to 100 kb) into req.body, and cookies into req.cookies.
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// 4. Every API route lives under /api, behind a general rate limit.
app.use('/api', apiLimiter, apiRoutes);

// 5. Nothing matched: answer 404. The error handler always goes last.
app.use(notFound);
app.use(errorHandler);

export default app;