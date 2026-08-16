import { describe, expect, it } from 'vitest';
import { SPARES, getSparePart } from '../../src/data/spares';
import type { Product } from '../../src/data/types';

/**
 * Guards the spare-parts catalog that (combined with CARE) feeds the Spares & Care
 * PLP. Like accessories, spares only need the fields a ProductCard renders.
 */

describe('SPARES contract', () => {
  it('is a non-empty array with unique ids', () => {
    expect(SPARES.length).toBeGreaterThan(0);
    const ids = SPARES.map((s) => s.id);
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(SPARES)('$id has the ProductCard-required fields correctly typed', (item: Product) => {
    expect(item.name.length).toBeGreaterThan(0);
    expect(item.brand.length).toBeGreaterThan(0);
    expect(item.category.length).toBeGreaterThan(0);
    expect(typeof item.price).toBe('number');
    expect(item.price).toBeGreaterThan(0);
    expect(item.rating).toBeGreaterThanOrEqual(0);
    expect(item.rating).toBeLessThanOrEqual(5);
    expect(item.reviewCount).toBeGreaterThanOrEqual(0);
  });

  it('spans multiple brands and spare categories', () => {
    expect(new Set(SPARES.map((s) => s.brand)).size).toBeGreaterThan(1);
    expect(new Set(SPARES.map((s) => s.category)).size).toBeGreaterThanOrEqual(4);
  });

  it('marks at least one spare out of stock so the sold-out card is exercised', () => {
    expect(SPARES.some((s) => s.inStock === false)).toBe(true);
  });
});

describe('getSparePart contract', () => {
  it('returns the matching spare for a known id', () => {
    expect(getSparePart('clear-race-visor')?.id).toBe('clear-race-visor');
  });
  it('returns undefined for an unknown id', () => {
    expect(getSparePart('does-not-exist')).toBeUndefined();
  });
});
