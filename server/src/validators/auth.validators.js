import { z } from 'zod';

// Tidy the text first (trim spaces, lowercase), then check it's an email address.
const email = z
  .string({ error: 'Enter your email address' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'));

// bcrypt only reads the first 72 bytes of a password, so longer ones are refused
// instead of being silently cut short.
const password = z
  .string({ error: 'Enter a password' })
  .min(8, 'Use at least 8 characters')
  .refine((value) => Buffer.byteLength(value) <= 72, 'Use at most 72 characters');

// POST /api/auth/register
export const registerBody = z.object({
  name: z.string({ error: 'Enter your name' }).trim().min(2, 'Enter your name').max(50),
  email,
  password,
});

// POST /api/auth/login. No length rules here: the stored hash decides if it's right.
export const loginBody = z.object({
  email,
  password: z.string({ error: 'Enter your password' }).min(1, 'Enter your password').max(200),
});