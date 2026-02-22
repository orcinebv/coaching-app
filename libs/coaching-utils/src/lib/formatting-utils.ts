/**
 * Truncate a string to a given length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a mood value as a descriptive label.
 */
export function moodLabel(mood: number): string {
  if (mood <= 2) return 'Zeer laag';
  if (mood <= 4) return 'Laag';
  if (mood <= 6) return 'Gemiddeld';
  if (mood <= 8) return 'Goed';
  return 'Uitstekend';
}

/**
 * Format a number as a percentage string.
 */
export function toPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
}
