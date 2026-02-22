import { isValidEmail, isValidMood, isValidEnergy, isValidPassword } from './validation-utils';

describe('validation-utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidMood', () => {
    it('should accept values 1-10', () => {
      expect(isValidMood(1)).toBe(true);
      expect(isValidMood(5)).toBe(true);
      expect(isValidMood(10)).toBe(true);
    });

    it('should reject out of range values', () => {
      expect(isValidMood(0)).toBe(false);
      expect(isValidMood(11)).toBe(false);
      expect(isValidMood(-1)).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(isValidMood(5.5)).toBe(false);
    });
  });

  describe('isValidEnergy', () => {
    it('should accept values 1-10', () => {
      expect(isValidEnergy(1)).toBe(true);
      expect(isValidEnergy(10)).toBe(true);
    });

    it('should reject out of range values', () => {
      expect(isValidEnergy(0)).toBe(false);
      expect(isValidEnergy(11)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should accept passwords of 8 or more characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('longpassword')).toBe(true);
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(isValidPassword('1234567')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });
});
