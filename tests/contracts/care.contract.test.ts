import { describe, expect, it } from 'vitest';
import { CARE, getCareProduct } from '../../src/data/care';
import type { Product } from '../../src/data/types';

/**
 * Guards the helmet-care catalog that feeds the home "Care" rail. Like accessories,
 * care items only need the fields a ProductCard renders.
 */

describe('CARE contract', () => {
  it('is a non-empty array with unique ids', () => {
    expect(CARE.length).toBeGreaterThan(0);
    const ids = CARE.map((c) => c.id);
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has enough items to fill the 5-card rail', () => {
    expect(CARE.length).toBeGreaterThanOrEqual(5);
  });

  it.each(CARE)('$id has the ProductCard-required fields correctly typed', (item: Product) => {
    expect(item.name.length).toBeGreaterThan(0);
    expect(item.brand.length).toBeGreaterThan(0);
    expect(item.category).toBe('Care');
    expect(typeof item.price).toBe('number');
    expect(item.price).toBeGreaterThan(0);
    expect(item.rating).toBeGreaterThanOrEqual(0);
    expect(item.rating).toBeLessThanOrEqual(5);
    expect(item.reviewCount).toBeGreaterThanOrEqual(0);
  });
});

describe('getCareProduct contract', () => {
  it('returns the matching item for a known id', () => {
    expect(getCareProduct('anti-fog-visor-kit')?.id).toBe('anti-fog-visor-kit');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCareProduct('does-not-exist')).toBeUndefined();
  });
});
