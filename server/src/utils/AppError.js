// An error we expect and want the client to see, like "Recipe not found" (404).
// Anything else that gets thrown is treated as a bug and becomes a generic 500.
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}