/**
 * Date Helper Utilities
 *
 * Client-safe date conversion helpers for converting between
 * string dates (from server) and Date objects (for client state).
 */

/**
 * Convert a date value (string, Date, or null) to a Date object
 * Handles various input formats safely
 */
export function toDate(value: string | Date | null | undefined): Date {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    // Check if date is valid
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback to current date
  return new Date();
}
