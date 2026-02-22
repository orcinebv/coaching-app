/**
 * Get the start of the current week (Sunday).
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a date as ISO date string (YYYY-MM-DD).
 */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is today.
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get number of days between two dates.
 */
export function daysBetween(start: Date, end: Date): number {
  const ms = Math.abs(end.getTime() - start.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
