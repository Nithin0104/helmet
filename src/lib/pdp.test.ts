import { describe, expect, it } from 'vitest';
import { getRatingDistribution, getRelatedProducts, getSku } from './pdp';
import { PRODUCTS } from '../data/products';
import type { Product } from '../data/types';

function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: 'test-helmet',
    name: 'Test Helmet',
    brand: 'TestBrand',
    category: 'Full-face',
    price: 9999,
    rating: 4.6,
    reviewCount: 100,
    ...over,
  };
}

describe('getRatingDistribution', () => {
  it('returns five buckets ordered 5★ down to 1★', () => {
    const dist = getRatingDistribution(makeProduct());
    expect(dist.map((b) => b.n)).toEqual([5, 4, 3, 2, 1]);
  });

  it('counts sum exactly to reviewCount when it exceeds the review sample', () => {
    const product = makeProduct({
      reviewCount: 100,
      reviews: [
        { id: 'a', author: 'A', rating: 5, date: '2026-01-01', title: 't', body: 'b' },
        { id: 'b', author: 'B', rating: 4, date: '2026-01-01', title: 't', body: 'b' },
      ],
    });
    const dist = getRatingDistribution(product);
    expect(dist.reduce((a, d) => a + d.count, 0)).toBe(100);
  });

  it('represents every real review in its bucket', () => {
    const product = makeProduct({
      reviewCount: 3,
      reviews: [
        { id: 'a', author: 'A', rating: 5, date: '2026-01-01', title: 't', body: 'b' },
        { id: 'b', author: 'B', rating: 5, date: '2026-01-01', title: 't', body: 'b' },
        { id: 'c', author: 'C', rating: 3, date: '2026-01-01', title: 't', body: 'b' },
      ],
    });
    const dist = getRatingDistribution(product);
    const byStar = Object.fromEntries(dist.map((d) => [d.n, d.count]));
    expect(byStar[5]).toBeGreaterThanOrEqual(2);
    expect(byStar[3]).toBeGreaterThanOrEqual(1);
  });

  it('is deterministic across calls', () => {
    const p = makeProduct();
    expect(getRatingDistribution(p)).toEqual(getRatingDistribution(p));
  });

  it('handles a product with no reviews without throwing', () => {
    const dist = getRatingDistribution(makeProduct({ reviewCount: 0, reviews: undefined }));
    expect(dist.reduce((a, d) => a + d.count, 0)).toBe(0);
  });
});

describe('getRelatedProducts', () => {
  const product = PRODUCTS[0];

  it('never includes the current product', () => {
    const related = getRelatedProducts(product, PRODUCTS, 6);
    expect(related.some((p) => p.id === product.id)).toBe(false);
  });

  it('returns at most n products', () => {
    expect(getRelatedProducts(product, PRODUCTS, 4)).toHaveLength(4);
  });

  it('prioritises same-category helmets first', () => {
    const related = getRelatedProducts(product, PRODUCTS, 6);
    const sameCategory = related.filter((p) => p.category === product.category);
    // The highest-ranked results should share the category before unrelated ones appear.
    expect(sameCategory.length).toBeGreaterThan(0);
    expect(related[0].category).toBe(product.category);
  });

  it('is deterministic', () => {
    expect(getRelatedProducts(product, PRODUCTS, 6)).toEqual(
      getRelatedProducts(product, PRODUCTS, 6),
    );
  });
});

describe('getSku', () => {
  it('derives an uppercase SKU from the product id', () => {
    expect(getSku(makeProduct({ id: 'velocity-rs-carbon' }))).toBe('VELOCITY-RS-CARBON');
  });
});
