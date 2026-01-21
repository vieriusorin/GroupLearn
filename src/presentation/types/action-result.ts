/**
 * Result type for Server Actions
 *
 * All Server Actions return this type to provide consistent error handling
 * and type-safe results on the client side.
 */

/**
 * Success result with data
 */
export type ActionSuccess<T> = {
  success: true;
  data: T;
};

/**
 * Failure result with error information
 */
export type ActionFailure<T = undefined> = {
  success: false;
  error: string;
  code?: string;
  validationErrors?: Record<string, string[]>;
  /**
   * Optional data payload for error results.
   * Some actions return structured data even when they fail
   * (for example, to provide more context for the UI).
   */
  data?: T;
};

/**
 * Union type for all action results
 */
export type ActionResult<T> = ActionSuccess<T> | ActionFailure<T>;

/**
 * Helper to create success result
 */
export const success = <T>(data: T): ActionSuccess<T> => ({
  success: true,
  data,
});

/**
 * Helper to create error result
 */
export const failure = (
  error: string,
  code?: string,
  validationErrors?: Record<string, string[]>,
): ActionFailure => ({
  success: false,
  error,
  code,
  validationErrors,
});

/**
 * Type guard to check if result is successful
 */
export const isSuccess = <T>(
  result: ActionResult<T>,
): result is ActionSuccess<T> => {
  return result.success === true;
};

/**
 * Type guard to check if result is failure
 */
export const isFailure = <T>(
  result: ActionResult<T>,
): result is ActionFailure<T> => {
  return result.success === false;
};
