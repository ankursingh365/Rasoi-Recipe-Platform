import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AUTH_COOKIE, clearAuthCookie, verifyToken } from '../utils/token.js';

// Works out who sent the request from the login cookie. Returns { user } or, when there's
// no usable login, { problem } with the reason.
async function readSession(req, res) {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) return { problem: 'Please log in first' };

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    clearAuthCookie(res); // the cookie is useless now, so tell the browser to drop it
    return { problem: 'Your session has ended. Please log in again' };
  }

  // The account might have been deleted since the token was made.
  const user = await User.findById(payload.sub);
  if (!user) return { problem: 'Please log in first' };

  // "Log out of all devices" raised tokenVersion, so tokens made before that are dead.
  if (payload.ver !== user.tokenVersion) {
    clearAuthCookie(res);
    return { problem: 'Your session has ended. Please log in again' };
  }

  return { user };
}

// For routes that need a logged-in user: puts them on req.user, or answers 401.
export async function requireAuth(req, res, next) {
  const { user, problem } = await readSession(req, res);
  if (!user) throw new AppError(401, problem);
  req.user = user;
  next();
}

// For routes anyone can use, but that show more to logged-in users (like "you saved this").
// req.user is the user, or null for a visitor. Never answers 401.
export async function optionalAuth(req, res, next) {
  const { user } = await readSession(req, res);
  req.user = user ?? null;
  next();
}