import { describe, expect, it } from 'vitest';
import { ACCESSORIES, getAccessory } from '../../src/data/accessories';
import { getBestsellers, getNewArrivals } from '../../src/data/products';
import type { Product } from '../../src/data/types';

/**
 * Guards the accessories catalog that feeds the home rails. Lighter than the
 * helmet contract: accessories only need the fields a ProductCard renders, so
 * colors/sizes/specs are intentionally not required here.
 */

describe('ACCESSORIES contract', () => {
  it('is a non-empty array with unique ids', () => {
    expect(ACCESSORIES.length).toBeGreaterThan(0);
    const ids = ACCESSORIES.map((a) => a.id);
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ACCESSORIES)('$id has the ProductCard-required fields correctly typed', (item: Product) => {
    expect(item.name.length).toBeGreaterThan(0);
    expect(item.brand.length).toBeGreaterThan(0);
    expect(item.category.length).toBeGreaterThan(0);
    expect(typeof item.price).toBe('number');
    expect(item.price).toBeGreaterThan(0);
    expect(item.rating).toBeGreaterThanOrEqual(0);
    expect(item.rating).toBeLessThanOrEqual(5);
    expect(item.reviewCount).toBeGreaterThanOrEqual(0);
  });

  it('spans multiple brands and categories', () => {
    expect(new Set(ACCESSORIES.map((a) => a.brand)).size).toBeGreaterThan(1);
    expect(new Set(ACCESSORIES.map((a) => a.category)).size).toBeGreaterThan(1);
  });

  it('has items tagged for both home rails', () => {
    expect(getBestsellers(ACCESSORIES).length).toBeGreaterThan(0);
    expect(getNewArrivals(ACCESSORIES).length).toBeGreaterThan(0);
  });
});

describe('getAccessory contract', () => {
  it('returns the matching accessory for a known id', () => {
    expect(getAccessory('pro-race-gloves')?.id).toBe('pro-race-gloves');
  });

  it('returns undefined for an unknown id', () => {
    expect(getAccessory('does-not-exist')).toBeUndefined();
  });
});

describe('home rail curation', () => {
  it('tags helmets for both the Bestsellers and New Arrivals rails', () => {
    expect(getBestsellers().length).toBeGreaterThan(0);
    expect(getNewArrivals().length).toBeGreaterThan(0);
  });
});
