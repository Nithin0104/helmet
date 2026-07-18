import { describe, expect, it } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats integer rupees with the ₹ symbol and grouping', () => {
    expect(formatPrice(42999)).toBe('₹42,999');
  });

  it('has no fractional part', () => {
    expect(formatPrice(1000)).toBe('₹1,000');
  });

  it('passes a preformatted string through untouched', () => {
    expect(formatPrice('£899')).toBe('£899');
  });

  it('renders a dash placeholder for null/undefined/empty', () => {
    expect(formatPrice(null)).toBe('₹—');
    expect(formatPrice(undefined)).toBe('₹—');
    expect(formatPrice('')).toBe('₹—');
  });

  it('formats zero as a real amount, not the placeholder', () => {
    expect(formatPrice(0)).toBe('₹0');
  });
});
