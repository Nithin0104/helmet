import { describe, expect, it } from 'vitest';
import { PLP_CONFIGS, facetConfigsOf } from '../../src/data/plp';
import type { PlpConfig } from '../../src/data/plp';

/**
 * Guards the PLP registry — the seam that lets one ShopPage serve every category.
 * A break here would ship a page with no dataset, no filters, or a duplicate route.
 */

const CONFIGS = Object.values(PLP_CONFIGS);

describe('PLP registry contract', () => {
  it.each(CONFIGS)('$slug has copy, a dataset and a filter rail', (config: PlpConfig) => {
    expect(config.title.length).toBeGreaterThan(0);
    expect(config.subtitle.length).toBeGreaterThan(0);
    expect(config.breadcrumb.length).toBeGreaterThan(0);
    expect(config.countNoun.length).toBeGreaterThan(0);
    expect(config.path.startsWith('/')).toBe(true);
    expect(config.products.length).toBeGreaterThan(0);
    expect(config.sortOptions.length).toBeGreaterThan(0);
    expect(config.filters.length).toBeGreaterThan(0);
  });

  it('every rail has exactly one price and one stock control', () => {
    for (const config of CONFIGS) {
      expect(config.filters.filter((f) => f.kind === 'price')).toHaveLength(1);
      expect(config.filters.filter((f) => f.kind === 'stock')).toHaveLength(1);
    }
  });

  it('facet controls have unique keys and rooted url params', () => {
    for (const config of CONFIGS) {
      const facets = facetConfigsOf(config);
      const ids = facets.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(facets.every((f) => f.urlParam.length > 0)).toBe(true);
    }
  });

  it('a scopedBy facet points at another facet in the same rail', () => {
    for (const config of CONFIGS) {
      const facets = facetConfigsOf(config);
      const ids = new Set(facets.map((f) => f.id));
      for (const f of facets) {
        if (f.scopedBy) expect(ids.has(f.scopedBy)).toBe(true);
      }
    }
  });

  it('routes are unique across the registry', () => {
    const paths = CONFIGS.map((c) => c.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('the new category pages use the 3-facet Category/Brand/Price rail', () => {
    for (const slug of ['accessories', 'spares-care'] as const) {
      const labels = PLP_CONFIGS[slug].filters
        .filter((f) => f.kind === 'facet')
        .map((f) => (f.kind === 'facet' ? f.label : ''));
      expect(labels).toEqual(['Category', 'Brand']);
    }
  });
});
