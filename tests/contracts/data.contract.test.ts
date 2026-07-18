import { describe, expect, it } from 'vitest';
import { PRODUCTS, getProduct } from '../../src/data/products';
import type { Product } from '../../src/data/types';

/**
 * Guards the shape of src/data/products.ts against src/data/types.ts. This is the
 * seam a real backend must honor when src/data/* swaps from a sync export to an
 * async fetch of the same shape — a break here is a break for every consumer.
 */

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

describe('PRODUCTS contract', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(PRODUCTS)).toBe(true);
    expect(PRODUCTS.length).toBeGreaterThan(0);
  });

  it('has unique, non-empty ids', () => {
    const ids = PRODUCTS.map((p) => p.id);
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(PRODUCTS)('$id has all required fields correctly typed', (product: Product) => {
    expect(typeof product.name).toBe('string');
    expect(product.name.length).toBeGreaterThan(0);
    expect(typeof product.brand).toBe('string');
    expect(product.brand.length).toBeGreaterThan(0);
    expect(typeof product.category).toBe('string');
    expect(product.category.length).toBeGreaterThan(0);
    expect(typeof product.price).toBe('number');
    expect(product.price).toBeGreaterThan(0);
    expect(typeof product.rating).toBe('number');
    expect(product.rating).toBeGreaterThanOrEqual(0);
    expect(product.rating).toBeLessThanOrEqual(5);
    expect(typeof product.reviewCount).toBe('number');
    expect(product.reviewCount).toBeGreaterThanOrEqual(0);
  });

  it.each(PRODUCTS.filter((p) => p.compareAtPrice !== undefined))(
    '$id compareAtPrice, when present, is a number greater than price',
    (product) => {
      expect(typeof product.compareAtPrice).toBe('number');
      expect(product.compareAtPrice as number).toBeGreaterThan(product.price);
    },
  );

  it.each(PRODUCTS.filter((p) => p.colors))('$id colors, when present, are well-formed', (product) => {
    const colors = product.colors!;
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) {
      expect(color.id.length).toBeGreaterThan(0);
      expect(color.name.length).toBeGreaterThan(0);
      expect(color.hex).toMatch(HEX_COLOR);
    }
    expect(new Set(colors.map((c) => c.id)).size).toBe(colors.length);
  });

  it.each(PRODUCTS.filter((p) => p.sizes))('$id sizes, when present, are well-formed', (product) => {
    const sizes = product.sizes!;
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(size.id.length).toBeGreaterThan(0);
      expect(size.label.length).toBeGreaterThan(0);
      expect(typeof size.available).toBe('boolean');
    }
    expect(new Set(sizes.map((s) => s.id)).size).toBe(sizes.length);
  });

  it.each(PRODUCTS.filter((p) => p.specs))('$id specs, when present, are well-formed', (product) => {
    for (const spec of product.specs!) {
      expect(spec.label.length).toBeGreaterThan(0);
      expect(spec.value.length).toBeGreaterThan(0);
    }
  });

  it.each(PRODUCTS.filter((p) => p.faqs))('$id faqs, when present, are well-formed with unique ids', (product) => {
    const faqs = product.faqs!;
    for (const faq of faqs) {
      expect(faq.id.length).toBeGreaterThan(0);
      expect(faq.question.length).toBeGreaterThan(0);
      expect(faq.answer.length).toBeGreaterThan(0);
    }
    expect(new Set(faqs.map((f) => f.id)).size).toBe(faqs.length);
  });

  it.each(PRODUCTS.filter((p) => p.reviews))(
    '$id reviews, when present, are well-formed with unique ids and 1-5 ratings',
    (product) => {
      const reviews = product.reviews!;
      for (const review of reviews) {
        expect(review.id.length).toBeGreaterThan(0);
        expect(review.author.length).toBeGreaterThan(0);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.title.length).toBeGreaterThan(0);
        expect(review.body.length).toBeGreaterThan(0);
      }
      expect(new Set(reviews.map((r) => r.id)).size).toBe(reviews.length);
    },
  );

  it('has at least one sparse product to exercise empty-state UI', () => {
    const sparse = PRODUCTS.filter((p) => !p.colors && !p.sizes && !p.reviews);
    expect(sparse.length).toBeGreaterThan(0);
  });
});

describe('getProduct contract', () => {
  it('returns the matching product for a known id', () => {
    const product = getProduct('velocity-rs-carbon');
    expect(product?.id).toBe('velocity-rs-carbon');
  });

  it('returns undefined for an unknown id', () => {
    expect(getProduct('does-not-exist')).toBeUndefined();
  });

  it('resolves synchronously today, the seam an async fetch of the same shape will replace', () => {
    const result = getProduct('velocity-rs-carbon');
    expect(result && typeof (result as unknown as { then?: unknown }).then).not.toBe('function');
  });
});
