import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AUTH_COOKIE, clearAuthCookie, verifyToken } from '../utils/token.js';

// Lets a request through only if it carries a valid login cookie, and puts the logged-in
// user on req.user for the controller. Use it on any route that needs a logged-in user.
export async function requireAuth(req, res, next) {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) throw new AppError(401, 'Please log in first');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    clearAuthCookie(res); // the cookie is useless now, so tell the browser to drop it
    throw new AppError(401, 'Your session has ended. Please log in again');
  }

  // The account might have been deleted since the token was made.
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, 'Please log in first');

  // "Log out of all devices" raised tokenVersion, so tokens made before that are dead.
  if (payload.ver !== user.tokenVersion) {
    clearAuthCookie(res);
    throw new AppError(401, 'Your session has ended. Please log in again');
  }

  req.user = user;
  next();
}