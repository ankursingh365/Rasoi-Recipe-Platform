import { AppError } from '../utils/AppError.js';

// Checks one part of the request (query, body or params) against a Zod schema.
// Usage in a route: validate('query', someSchema)
// The cleaned-up values are saved as req.valid.query (or req.valid.body, req.valid.params).
export function validate(part, schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const details = {};
      for (const issue of result.error.issues) {
        details[issue.path.join('.') || part] ??= issue.message; // keep each field's first problem
      }
      return next(new AppError(400, 'Some fields are invalid', details));
    }

    // Express 5 doesn't let you overwrite req.query, so the clean values live here instead.
    req.valid = { ...req.valid, [part]: result.data };
    next();
  };
}