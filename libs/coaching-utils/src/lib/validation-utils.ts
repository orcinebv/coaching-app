/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a mood value is within the valid range (1-10).
 */
export function isValidMood(mood: number): boolean {
  return Number.isInteger(mood) && mood >= 1 && mood <= 10;
}

/**
 * Check if an energy value is within the valid range (1-10).
 */
export function isValidEnergy(energy: number): boolean {
  return Number.isInteger(energy) && energy >= 1 && energy <= 10;
}

/**
 * Validate password strength: minimum 8 characters.
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
