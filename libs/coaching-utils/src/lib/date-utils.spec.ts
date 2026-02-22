import { getWeekStart, toDateString, isToday, daysBetween } from './date-utils';

describe('date-utils', () => {
  describe('getWeekStart', () => {
    it('should return the Sunday of the current week', () => {
      // Wednesday Feb 12 2025
      const date = new Date(2025, 1, 12);
      const result = getWeekStart(date);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('should return same day if already Sunday', () => {
      const sunday = new Date(2025, 1, 9); // Sunday
      const result = getWeekStart(sunday);
      expect(result.getDay()).toBe(0);
      expect(result.getDate()).toBe(9);
    });

    it('should default to current date if none provided', () => {
      const result = getWeekStart();
      expect(result.getDay()).toBe(0);
    });
  });

  describe('toDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2025-03-15T12:00:00Z');
      expect(toDateString(date)).toBe('2025-03-15');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-11');
      expect(daysBetween(start, end)).toBe(10);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2025-01-01');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should handle reversed order', () => {
      const start = new Date('2025-01-11');
      const end = new Date('2025-01-01');
      expect(daysBetween(start, end)).toBe(10);
    });
  });
});
