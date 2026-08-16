/**
 * PDP-derived data. The catalog carries flat `rating`/`reviewCount` and a small
 * sample of `reviews`, and has no explicit "related products" or star-histogram
 * fields — so the PDP derives both at render (memoised in the page). Kept pure and
 * deterministic so the same product always yields the same bars and rail, and so a
 * real API returning the same `Product` shape drops in unchanged.
 */
import type { Product } from '../data/types';

export interface RatingBucket {
  /** Star value, 1–5. */
  n: number;
  count: number;
}

/**
 * Star-rating histogram for the review summary. Buckets the real `reviews` sample,
 * then, when `reviewCount` exceeds the sample, allocates the remainder across stars
 * with a bell curve centred on the average `rating` (largest-remainder rounding so
 * the counts sum exactly to `reviewCount`). Real reviews are always represented.
 * Returned high-to-low (5★ first) to match the DC design.
 */
export function getRatingDistribution(product: Product): RatingBucket[] {
  const sampled = [0, 0, 0, 0, 0]; // index 0 => 1★ … index 4 => 5★
  for (const r of product.reviews ?? []) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    sampled[star - 1] += 1;
  }
  const sampledTotal = sampled.reduce((a, b) => a + b, 0);
  const total = Math.max(product.reviewCount || 0, sampledTotal);
  const remaining = total - sampledTotal;

  const counts = [...sampled];
  if (remaining > 0) {
    const avg = product.rating || 5;
    // Bell-curve weight per star, peaked at the average rating.
    const weights = [1, 2, 3, 4, 5].map((star) => {
      const d = star - avg;
      return Math.max(0.01, Math.exp(-(d * d) / 0.7));
    });
    const weightSum = weights.reduce((a, b) => a + b, 0);
    // Largest-remainder apportionment so the extra counts sum to `remaining` exactly.
    const exact = weights.map((w) => (w / weightSum) * remaining);
    const floors = exact.map((x) => Math.floor(x));
    let left = remaining - floors.reduce((a, b) => a + b, 0);
    const order = exact
      .map((x, i) => ({ i, frac: x - Math.floor(x) }))
      .sort((a, b) => b.frac - a.frac);
    for (let k = 0; k < order.length && left > 0; k++, left--) floors[order[k].i] += 1;
    for (let i = 0; i < 5; i++) counts[i] += floors[i];
  }

  return [5, 4, 3, 2, 1].map((n) => ({ n, count: counts[n - 1] }));
}

/**
 * "You may also like" rail: same category first, then padded with other helmets by
 * shared brand and rating. Excludes the current product; stable/deterministic order.
 */
export function getRelatedProducts(product: Product, all: Product[], n = 6): Product[] {
  const pool = all.filter((p) => p.id !== product.id);
  const score = (p: Product) =>
    (p.category === product.category ? 100 : 0) +
    (p.brand === product.brand ? 20 : 0) +
    p.rating;
  return [...pool].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)).slice(0, n);
}

/** Display SKU derived from the product id (no dedicated field in the catalog). */
export function getSku(product: Product): string {
  return product.id.toUpperCase();
}
