import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'rasoi_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// A JWT is a signed note: { sub: <user id>, ver: <token version>, iat: <issued>, exp: <expires> }.
// Anyone can read it, but only someone who knows JWT_SECRET can make one that verify() accepts.
export function signToken(user) {
  return jwt.sign({ sub: user.id, ver: user.tokenVersion }, env.JWT_SECRET, { expiresIn: '7d' });
}

// Returns what's inside, or throws if the token was changed, signed with another secret,
// or has expired. Only HS256 is accepted, the algorithm sign() uses.
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}

const cookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it, so an XSS attack can't steal it
  secure: env.NODE_ENV === 'production', // HTTPS only on the live site (localhost is plain HTTP)
  sameSite: 'lax', // not sent when another website submits a form to yours
  path: '/', // sent with every request to this site
};

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions, maxAge: SEVEN_DAYS_MS });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
}