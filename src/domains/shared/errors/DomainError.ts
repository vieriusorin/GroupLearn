/**
 * Base error class for all domain errors
 *
 * Domain errors represent business rule violations or invalid states
 * that should be handled gracefully in the application.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }
}
