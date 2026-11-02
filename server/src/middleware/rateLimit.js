import { rateLimit } from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Send "too many requests" through our own error handler, so it has the usual JSON shape.
function tooMany(message) {
  return (req, res, next) => next(new AppError(429, message));
}

// Login and sign-up: 10 failed attempts per IP address every 15 minutes. Successful
// requests don't count, so this only slows down someone guessing passwords.
export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8', // tell clients their limit in RateLimit-* response headers
  legacyHeaders: false,
  handler: tooMany('Too many attempts. Please try again in 15 minutes.'),
});

// Everything else: a generous limit that stops one client hammering the whole API.
export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooMany('Too many requests. Please slow down.'),
});