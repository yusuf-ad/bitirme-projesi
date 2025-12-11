/**
 * Normalizes a date parameter from URL params to a Date object
 * Handles both string and array values, falls back to today if invalid
 */
export function normalizeDateParam(value: unknown): Date {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (typeof rawValue === "string") {
    const parsed = new Date(rawValue);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }

  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  return fallback;
}

/**
 * Formats a Date object to YYYY-MM-DD string format
 */
export function formatDate(date: Date): string {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(
    normalized.getDate()
  )}`;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

