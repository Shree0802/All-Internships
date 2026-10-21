import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatDate,
  truncateText,
  generateInitials,
  calculateDiscount,
} from '../utils/formatters';

describe('formatters utility', () => {
  describe('formatPrice', () => {
    it('formats a valid number as INR currency', () => {
      const result = formatPrice(1999);
      expect(result).toContain('1,999');
    });

    it('handles zero or missing values gracefully', () => {
      expect(formatPrice(0)).toBe('₹0');
      expect(formatPrice(null)).toBe('₹0');
      expect(formatPrice(undefined)).toBe('₹0');
    });
  });

  describe('calculateDiscount', () => {
    it('calculates the correct percentage discount', () => {
      expect(calculateDiscount(2000, 1500)).toBe(25);
      expect(calculateDiscount(1000, 800)).toBe(20);
    });

    it('returns 0 when sale price is equal or higher than original', () => {
      expect(calculateDiscount(1000, 1000)).toBe(0);
      expect(calculateDiscount(1000, 1200)).toBe(0);
    });
  });

  describe('generateInitials', () => {
    it('generates two initials from full name', () => {
      expect(generateInitials('Prathamesh Patil')).toBe('PP');
      expect(generateInitials('Virat Kohli')).toBe('VK');
    });

    it('generates two letters from single word', () => {
      expect(generateInitials('Athlete')).toBe('AT');
    });

    it('defaults to DY when empty or invalid', () => {
      expect(generateInitials('')).toBe('DY');
      expect(generateInitials(null)).toBe('DY');
    });
  });

  describe('truncateText', () => {
    it('truncates text that exceeds maximum length', () => {
      const text = 'This is an engineered ultra-breathable collegiate sports jersey for tournament finals';
      expect(truncateText(text, 20)).toBe('This is an engineere...');
    });

    it('leaves shorter text untouched', () => {
      expect(truncateText('DYPULSE PLAY', 30)).toBe('DYPULSE PLAY');
    });
  });
});
