import { DomainError } from "./DomainError";

/**
 * Validation error for input validation failures
 *
 * Can include field-level validation errors for form handling
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Create a validation error for a single field
   */
  static forField(field: string, message: string): ValidationError {
    return new ValidationError(message, {
      [field]: [message],
    });
  }

  /**
   * Create a validation error for multiple fields
   */
  static forFields(errors: Record<string, string | string[]>): ValidationError {
    const normalizedErrors: Record<string, string[]> = {};

    for (const [field, messages] of Object.entries(errors)) {
      normalizedErrors[field] = Array.isArray(messages) ? messages : [messages];
    }

    return new ValidationError("Validation failed", normalizedErrors);
  }
}
