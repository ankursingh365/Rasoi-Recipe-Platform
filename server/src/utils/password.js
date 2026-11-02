import bcrypt from 'bcryptjs';

// How much work bcrypt does per password; each +1 doubles it. 10 takes about a tenth of a
// second on a laptop and is the minimum the OWASP security guidelines recommend. Render's
// free servers are much slower than a laptop, so a higher cost would make login sluggish there.
const COST = 10;

export const hashPassword = (password) => bcrypt.hash(password, COST);

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);