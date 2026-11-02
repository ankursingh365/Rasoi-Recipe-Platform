import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token.js';

// A hash to check against when nobody has the email that was typed (see login).
const DUMMY_HASH = await hashPassword('no-account-has-this-password');

// POST /api/auth/register: create an account and log straight in.
export async function register(req, res) {
  const { name, email, password } = req.valid.body;

  // No "is this email taken?" check first: two sign-ups arriving at the same moment could
  // both pass it. The unique index on email is the real guarantee. A duplicate makes
  // create() fail with error 11000, and the step 5 error handler answers 409.
  const user = await User.create({ name, email, passwordHash: await hashPassword(password) });

  setAuthCookie(res, signToken(user));
  res.status(201).json({ user });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.valid.body;

  // passwordHash has select: false (step 10), so ask for it by name.
  const user = await User.findOne({ email }).select('+passwordHash');

  // Run bcrypt even when the email doesn't exist. Otherwise "no such account" would come
  // back faster than "wrong password", and the timing would reveal who has an account.
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  // One message for both cases, for the same reason.
  if (!user || !passwordOk) throw new AppError(401, 'Wrong email or password');

  setAuthCookie(res, signToken(user));
  res.json({ user });
}

// POST /api/auth/logout
export function logout(req, res) {
  clearAuthCookie(res);
  res.status(204).end(); // 204 No Content: done, and nothing to send back
}

// POST /api/auth/logout-all: end every session of this account, on every device.
export async function logoutAll(req, res) {
  // $inc adds 1 inside the database in one step, so two clicks at once can't lose an update.
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  clearAuthCookie(res);
  res.status(204).end();
}

// GET /api/auth/me: who is logged in? The React app will ask this when it starts.
export function me(req, res) {
  res.json({ user: req.user });
}