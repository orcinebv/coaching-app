import { truncate, moodLabel, toPercentage } from './formatting-utils';

describe('formatting-utils', () => {
  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('hello world!', 8)).toBe('hello...');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });

  describe('moodLabel', () => {
    it('should return correct labels for mood ranges', () => {
      expect(moodLabel(1)).toBe('Zeer laag');
      expect(moodLabel(2)).toBe('Zeer laag');
      expect(moodLabel(3)).toBe('Laag');
      expect(moodLabel(4)).toBe('Laag');
      expect(moodLabel(5)).toBe('Gemiddeld');
      expect(moodLabel(6)).toBe('Gemiddeld');
      expect(moodLabel(7)).toBe('Goed');
      expect(moodLabel(8)).toBe('Goed');
      expect(moodLabel(9)).toBe('Uitstekend');
      expect(moodLabel(10)).toBe('Uitstekend');
    });
  });

  describe('toPercentage', () => {
    it('should format as percentage', () => {
      expect(toPercentage(50, 100)).toBe('50%');
      expect(toPercentage(1, 3)).toBe('33%');
    });

    it('should handle zero total', () => {
      expect(toPercentage(0, 0)).toBe('0%');
    });

    it('should round to nearest integer', () => {
      expect(toPercentage(1, 3)).toBe('33%');
      expect(toPercentage(2, 3)).toBe('67%');
    });
  });
});
