import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Runs when no route matched the request.
export function notFound(req, res, next) {
  next(new AppError(404, `No route for ${req.method} ${req.originalUrl}`));
}

// Express treats a middleware with 4 arguments as the error handler. Every error,
// thrown anywhere in a route, ends up here, so all errors reach the client in one shape:
// { "error": { "message": "...", "details": ... } }
export function errorHandler(err, req, res, next) {
  const { status, message, details } = toHttpError(err);

  // 500s are bugs: print the whole error, with its stack trace, to the terminal.
  if (status >= 500) console.error(err);

  const body = { error: { message } };
  if (details) body.error.details = details;
  res.status(status).json(body);
}

// Turns any error into a status code and a message that's safe to show.
function toHttpError(err) {
  if (err instanceof AppError) return err;

  // The request body wasn't valid JSON (thrown by express.json()).
  if (err.type === 'entity.parse.failed') {
    return { status: 400, message: 'Request body is not valid JSON' };
  }

  // An id that isn't a valid MongoDB ObjectId, like /api/recipes/abc.
  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, message: `Invalid ${err.path}: ${err.value}` };
  }

  // A document broke its schema's rules, e.g. a recipe with no title.
  if (err instanceof mongoose.Error.ValidationError) {
    const details = {};
    for (const [field, fieldError] of Object.entries(err.errors)) {
      details[field] = fieldError.message;
    }
    return { status: 400, message: 'Some fields are invalid', details };
  }

  // A unique index was broken, e.g. signing up with an email that's already registered.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value';
    return { status: 409, message: `That ${field} is already taken` };
  }

  // Anything else is a bug. In production, don't reveal what went wrong inside.
  const message = env.NODE_ENV === 'production' ? 'Something went wrong' : err.message;
  return { status: 500, message };
}