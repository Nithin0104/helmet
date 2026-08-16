import { describe, expect, it } from 'vitest';
import { formatPrice, formatCompact } from './format';

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

describe('formatCompact', () => {
  it('leaves values under 1000 as-is', () => {
    expect(formatCompact(950)).toBe('950');
    expect(formatCompact(0)).toBe('0');
  });

  it('abbreviates thousands with one decimal, dropping a trailing .0', () => {
    expect(formatCompact(2100)).toBe('2.1k');
    expect(formatCompact(2000)).toBe('2k');
    expect(formatCompact(1500)).toBe('1.5k');
  });

  it('abbreviates millions', () => {
    expect(formatCompact(1_500_000)).toBe('1.5M');
    expect(formatCompact(3_000_000)).toBe('3M');
  });
});
