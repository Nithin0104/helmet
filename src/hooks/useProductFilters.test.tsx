import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useProductFilters } from './useProductFilters';
import { deriveFacets } from '../lib/catalog';
import { PRODUCTS } from '../data/products';

const facets = deriveFacets(PRODUCTS);

function wrapperAt(initial: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  );
}

function setup(initial = '/shop') {
  return renderHook(() => useProductFilters(facets), { wrapper: wrapperAt(initial) });
}

describe('useProductFilters', () => {
  it('defaults to empty filters, featured sort, page 1', () => {
    const { result } = setup();
    expect(result.current.filters.brand).toEqual([]);
    expect(result.current.sort).toBe('featured');
    expect(result.current.page).toBe(1);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.priceBounds.max).toBe(facets.priceMax);
  });

  it('hydrates state from a deep-linked query string', () => {
    const { result } = setup('/shop?brand=mt-helmets&type=full-face&sort=price-asc&page=2');
    expect(result.current.filters.brand).toContain('MT Helmets');
    expect(result.current.filters.category).toContain('Full-face');
    expect(result.current.sort).toBe('price-asc');
    expect(result.current.page).toBe(2);
  });

  it('ignores unknown facet slugs (corrupt query degrades gracefully)', () => {
    const { result } = setup('/shop?brand=not-a-real-brand');
    expect(result.current.filters.brand).toEqual([]);
  });

  it('toggling a facet writes a slug and resets to page 1', () => {
    const { result } = setup('/shop?page=3');
    expect(result.current.page).toBe(3);
    act(() => result.current.toggleFacet('brand', 'MT Helmets'));
    expect(result.current.filters.brand).toEqual(['MT Helmets']);
    expect(result.current.page).toBe(1);
    act(() => result.current.toggleFacet('brand', 'MT Helmets'));
    expect(result.current.filters.brand).toEqual([]);
  });

  it('parses a legacy single-number price as a max cap and clears it', () => {
    const { result } = setup('/shop?price=20000');
    expect(result.current.filters.priceMax).toBe(20000);
    expect(result.current.filters.priceMin).toBeNull();
    expect(result.current.activeChips.some((c) => c.value === 'price')).toBe(true);
    act(() => result.current.setPriceRange(null, null));
    expect(result.current.filters.priceMax).toBeNull();
  });

  it('parses a min-max price window and exposes a combined chip', () => {
    const { result } = setup('/shop?price=15000-40000');
    expect(result.current.filters.priceMin).toBe(15000);
    expect(result.current.filters.priceMax).toBe(40000);
    const chip = result.current.activeChips.find((c) => c.value === 'price');
    expect(chip?.label).toContain('–');
  });

  it('setPriceRange writes a min-max param and drops bounds at the catalog edges', () => {
    const { result } = setup('/shop');
    const { min, max } = result.current.priceBounds;
    act(() => result.current.setPriceRange(min + 5000, max - 5000));
    expect(result.current.filters.priceMin).toBe(min + 5000);
    expect(result.current.filters.priceMax).toBe(max - 5000);
    // Setting back to the full range removes the param entirely.
    act(() => result.current.setPriceRange(min, max));
    expect(result.current.filters.priceMin).toBeNull();
    expect(result.current.filters.priceMax).toBeNull();
  });

  it('parses and toggles the in-stock flag', () => {
    const { result } = setup('/shop?stock=1');
    expect(result.current.filters.inStock).toBe(true);
    act(() => result.current.toggleInStock());
    expect(result.current.filters.inStock).toBe(false);
  });

  it('builds removable chips and removeChip clears the right facet', () => {
    const { result } = setup('/shop?brand=mt-helmets');
    const chip = result.current.activeChips.find((c) => c.value.startsWith('brand:'));
    expect(chip?.group).toBe('Brand');
    expect(chip?.label).toBe('MT Helmets');
    act(() => result.current.removeChip(chip!));
    expect(result.current.filters.brand).toEqual([]);
  });

  it('clearAll removes filters but keeps the sort', () => {
    const { result } = setup('/shop?brand=mt-helmets&price=20000&stock=1&sort=price-desc');
    act(() => result.current.clearAll());
    expect(result.current.activeCount).toBe(0);
    expect(result.current.filters.priceMax).toBeNull();
    expect(result.current.filters.inStock).toBe(false);
    expect(result.current.sort).toBe('price-desc');
  });

  it('setPage and setSort update the URL and reset page appropriately', () => {
    const { result } = setup('/shop');
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
    act(() => result.current.setSort('top-rated'));
    expect(result.current.sort).toBe('top-rated');
    expect(result.current.page).toBe(1);
  });
});
