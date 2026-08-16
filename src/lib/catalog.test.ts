import { describe, it, expect } from 'vitest';
import {
  isInStock,
  filterProducts,
  sortProducts,
  countFor,
  facetCounts,
  deriveFacets,
  paginate,
  EMPTY_FILTERS,
} from './catalog';
import type { FilterState } from './catalog';
import type { Product } from '../data/types';

function mk(partial: Partial<Product> & Pick<Product, 'id' | 'price'>): Product {
  return {
    name: partial.id,
    brand: 'BrandA',
    category: 'Full-face',
    rating: 4,
    reviewCount: 10,
    ...partial,
  } as Product;
}

const f = (o: Partial<FilterState> = {}): FilterState => ({
  ...EMPTY_FILTERS,
  brand: [],
  category: [],
  certification: [],
  color: [],
  size: [],
  ...o,
});

const A = mk({
  id: 'a',
  price: 100,
  brand: 'Apex',
  category: 'Full-face',
  certification: 'ECE 22.06',
  colors: [{ id: 'red', name: 'Red', hex: '#c0392b' }],
  sizes: [{ id: 'm', label: 'M', available: true }],
  rating: 4.5,
  reviewCount: 50,
  featured: 'new',
});
const B = mk({
  id: 'b',
  price: 200,
  brand: 'Bolt',
  category: 'Modular',
  certification: 'ISI',
  colors: [{ id: 'blue', name: 'Blue', hex: '#2e6bff' }],
  sizes: [{ id: 'l', label: 'L', available: false }],
  rating: 4.0,
  reviewCount: 200,
  badge: 'New',
});
const C = mk({
  id: 'c',
  price: 300,
  brand: 'Apex',
  category: 'Adventure',
  certification: 'ECE 22.06',
  colors: [
    { id: 'red', name: 'Red', hex: '#c0392b' },
    { id: 'blue', name: 'Blue', hex: '#2e6bff' },
  ],
  sizes: [
    { id: 'm', label: 'M', available: true },
    { id: 'l', label: 'L', available: false },
  ],
  rating: 4.8,
  reviewCount: 10,
});
const SET = [A, B, C];
const ids = (list: Product[]) => list.map((p) => p.id);

describe('isInStock', () => {
  it('is true when there are no sizes', () => {
    expect(isInStock(mk({ id: 'x', price: 1 }))).toBe(true);
  });
  it('is true when at least one size is available', () => {
    expect(isInStock(C)).toBe(true);
  });
  it('is false when every size is unavailable', () => {
    expect(isInStock(B)).toBe(false);
  });
  it('honors an explicit inStock flag on sizeless products', () => {
    expect(isInStock(mk({ id: 'oos', price: 1, inStock: false }))).toBe(false);
    expect(isInStock(mk({ id: 'ok', price: 1, inStock: true }))).toBe(true);
  });
  it('lets the explicit flag override the size-derived result', () => {
    // In-stock sizes present, but the flag forces sold out.
    expect(isInStock(mk({ ...A, id: 'a2', inStock: false }))).toBe(false);
  });
});

describe('filterProducts', () => {
  it('returns all with empty filters', () => {
    expect(ids(filterProducts(SET, f()))).toEqual(['a', 'b', 'c']);
  });
  it('filters by brand (multi-select within a group is OR)', () => {
    expect(ids(filterProducts(SET, f({ brand: ['Apex'] })))).toEqual(['a', 'c']);
  });
  it('filters by category', () => {
    expect(ids(filterProducts(SET, f({ category: ['Modular'] })))).toEqual(['b']);
  });
  it('filters by certification', () => {
    expect(ids(filterProducts(SET, f({ certification: ['ISI'] })))).toEqual(['b']);
  });
  it('filters by colour', () => {
    expect(ids(filterProducts(SET, f({ color: ['blue'] })))).toEqual(['b', 'c']);
  });
  it('filters by size', () => {
    expect(ids(filterProducts(SET, f({ size: ['m'] })))).toEqual(['a', 'c']);
  });
  it('filters by price cap', () => {
    expect(ids(filterProducts(SET, f({ priceMax: 200 })))).toEqual(['a', 'b']);
  });
  it('filters by price floor', () => {
    expect(ids(filterProducts(SET, f({ priceMin: 200 })))).toEqual(['b', 'c']);
  });
  it('filters by a price window (min and max)', () => {
    expect(ids(filterProducts(SET, f({ priceMin: 150, priceMax: 250 })))).toEqual(['b']);
  });
  it('filters by in-stock (derived from size availability)', () => {
    expect(ids(filterProducts(SET, f({ inStock: true })))).toEqual(['a', 'c']);
  });
  it('combines groups with AND across facets', () => {
    expect(ids(filterProducts(SET, f({ brand: ['Apex'], priceMax: 150 })))).toEqual(['a']);
  });
  it('returns empty when nothing matches', () => {
    expect(filterProducts(SET, f({ brand: ['Nope'] }))).toEqual([]);
  });
});

describe('sortProducts', () => {
  it('preserves catalog order for featured', () => {
    expect(ids(sortProducts(SET, 'featured'))).toEqual(['a', 'b', 'c']);
  });
  it('sorts price ascending', () => {
    expect(ids(sortProducts(SET, 'price-asc'))).toEqual(['a', 'b', 'c']);
  });
  it('sorts price descending', () => {
    expect(ids(sortProducts(SET, 'price-desc'))).toEqual(['c', 'b', 'a']);
  });
  it('sorts by rating (top rated)', () => {
    expect(ids(sortProducts(SET, 'top-rated'))).toEqual(['c', 'a', 'b']);
  });
  it('sorts by review count (best selling)', () => {
    expect(ids(sortProducts(SET, 'best-selling'))).toEqual(['b', 'a', 'c']);
  });
  it('sorts newest by featured/new then badge', () => {
    expect(ids(sortProducts(SET, 'newest'))).toEqual(['a', 'b', 'c']);
  });
  it('does not mutate the input array', () => {
    const input = [...SET];
    sortProducts(input, 'price-desc');
    expect(ids(input)).toEqual(['a', 'b', 'c']);
  });
});

describe('countFor', () => {
  it('counts across the full catalog with no filters', () => {
    expect(countFor(SET, f(), 'brand', 'Apex')).toBe(2);
  });
  it('is count-aware: applies other facets but ignores its own group', () => {
    // With brand=Apex active, the category counts reflect only Apex products.
    expect(countFor(SET, f({ brand: ['Apex'] }), 'category', 'Adventure')).toBe(1);
    expect(countFor(SET, f({ brand: ['Apex'] }), 'category', 'Full-face')).toBe(1);
    expect(countFor(SET, f({ brand: ['Apex'] }), 'category', 'Modular')).toBe(0);
  });
});

describe('facetCounts', () => {
  it('matches countFor for every value but computes them together', () => {
    const filters = f({ brand: ['Apex'] });
    const counts = facetCounts(SET, filters);
    for (const [value] of counts.category) {
      expect(counts.category.get(value)).toBe(countFor(SET, filters, 'category', value));
    }
    expect(counts.category.get('Adventure')).toBe(1);
    expect(counts.category.get('Full-face')).toBe(1);
  });
  it('returns a map per facet key', () => {
    const counts = facetCounts(SET, f());
    expect(counts.brand.get('Apex')).toBe(2);
    expect(counts.color.get('blue')).toBe(2);
    expect(counts.size.get('m')).toBe(2);
  });
});

describe('deriveFacets', () => {
  const facets = deriveFacets(SET);
  it('derives price bounds from the catalog', () => {
    expect(facets.priceMin).toBe(100);
    expect(facets.priceMax).toBe(300);
  });
  it('orders brands by count desc then label, counts summing to the catalog', () => {
    expect(facets.brand.map((b) => b.value)).toEqual(['Apex', 'Bolt']);
    expect(facets.brand.reduce((n, b) => n + b.count, 0)).toBe(SET.length);
  });
  it('exposes swatch colours with hex and dedupes by id', () => {
    const red = facets.color.find((c) => c.value === 'red');
    expect(red?.hex).toBe('#c0392b');
    expect(red?.count).toBe(2);
  });
  it('orders sizes by the canonical ladder, not alphabetically', () => {
    expect(facets.size.map((s) => s.value)).toEqual(['m', 'l']);
    expect(facets.size[0].label).toBe('M');
  });
  it('lists certifications present in the catalog', () => {
    expect(facets.certification.map((c) => c.value)).toContain('ECE 22.06');
    expect(facets.certification.map((c) => c.value)).toContain('ISI');
  });
});

describe('paginate', () => {
  const list = Array.from({ length: 10 }, (_, i) => i + 1);
  it('slices the first page and reports bounds', () => {
    const r = paginate(list, 1, 4);
    expect(r.items).toEqual([1, 2, 3, 4]);
    expect(r.pageCount).toBe(3);
    expect(r.total).toBe(10);
    expect(r.start).toBe(1);
    expect(r.end).toBe(4);
  });
  it('slices a trailing partial page', () => {
    const r = paginate(list, 3, 4);
    expect(r.items).toEqual([9, 10]);
    expect(r.start).toBe(9);
    expect(r.end).toBe(10);
  });
  it('clamps an out-of-range page down to the last', () => {
    expect(paginate(list, 99, 4).page).toBe(3);
  });
  it('handles an empty list', () => {
    const r = paginate([], 1, 9);
    expect(r.items).toEqual([]);
    expect(r.pageCount).toBe(1);
    expect(r.total).toBe(0);
    expect(r.start).toBe(0);
    expect(r.end).toBe(0);
  });
});
