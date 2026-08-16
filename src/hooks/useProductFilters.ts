import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FILTER_SCHEMA,
  SORT_OPTIONS,
  DEFAULT_SORT,
  PRICE_PARAM,
  STOCK_PARAM,
  SORT_PARAM,
  PAGE_PARAM,
} from '../data/filters';
import type { FilterKey, FacetConfig } from '../data/filters';
import type { FilterState, SortKey, DerivedFacets } from '../lib/catalog';
import { FILTER_KEYS } from '../lib/catalog';
import { formatPrice } from '../lib/format';

/** An applied-filter chip (structurally the composite's `AppliedFilterChip`). */
export interface PlpChip {
  group: string;
  label: string;
  /** Stable, encodes what to remove: `"<facet>:<value>"`, `"price"`, or `"stock"`. */
  value: string;
}

export interface UseProductFilters {
  filters: FilterState;
  sort: SortKey;
  page: number;
  priceBounds: { min: number; max: number };
  activeChips: PlpChip[];
  activeCount: number;
  toggleFacet: (key: FilterKey, value: string) => void;
  setFacet: (key: FilterKey, values: string[]) => void;
  /** Set the price window; pass `null` for a bound to mean the catalog min/max. */
  setPriceRange: (min: number | null, max: number | null) => void;
  toggleInStock: () => void;
  setSort: (value: SortKey) => void;
  setPage: (value: number) => void;
  removeChip: (chip: { value?: string }) => void;
  clearAll: () => void;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Single source of PLP filter/sort/pagination state, stored in the URL query string
 * (`?brand=…&type=…&cert=…&price=…&stock=1&sort=…&page=2`). Values are slugified and
 * validated against the derived facets, so links are shareable and a corrupt query
 * degrades gracefully. Any facet/sort change resets to page 1.
 *
 * `facetConfigs` is the current page's facet rail (defaults to the Helmets schema);
 * facets absent from it are never read or written, so an Accessories page that only
 * uses category + brand ignores the helmet-only params entirely.
 */
export function useProductFilters(
  facets: DerivedFacets,
  facetConfigs: FacetConfig[] = FILTER_SCHEMA,
): UseProductFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const schemaByKey = useMemo(
    () =>
      Object.fromEntries(facetConfigs.map((c) => [c.id, c])) as Partial<
        Record<FilterKey, FacetConfig>
      >,
    [facetConfigs],
  );

  // Slug ↔ value maps, built from the real facet values.
  const { slugToValue, valueToSlug } = useMemo(() => {
    const slugToValue = {} as Record<FilterKey, Map<string, string>>;
    const valueToSlug = {} as Record<FilterKey, Map<string, string>>;
    for (const key of FILTER_KEYS) {
      slugToValue[key] = new Map();
      valueToSlug[key] = new Map();
    }
    const add = (key: FilterKey, value: string) => {
      const s = slugify(value);
      valueToSlug[key].set(value, s);
      slugToValue[key].set(s, value);
    };
    facets.brand.forEach((o) => add('brand', o.value));
    facets.category.forEach((o) => add('category', o.value));
    facets.certification.forEach((o) => add('certification', o.value));
    facets.color.forEach((o) => add('color', o.value));
    facets.size.forEach((o) => add('size', o.value));
    return { slugToValue, valueToSlug };
  }, [facets]);

  const readFacet = (key: FilterKey): string[] => {
    const cfg = schemaByKey[key];
    if (!cfg) return [];
    const raw = searchParams.get(cfg.urlParam);
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => slugToValue[key].get(s))
      .filter((v): v is string => Boolean(v));
  };

  // Price param is `min-max` (e.g. `15000-40000`); a single number is treated as a
  // legacy max-only bound. A bound at/beyond the catalog edge counts as "no bound".
  const priceRaw = searchParams.get(PRICE_PARAM);
  let priceMin: number | null = null;
  let priceMax: number | null = null;
  if (priceRaw) {
    const parts = priceRaw.split('-').map(Number);
    const lo = parts.length === 2 ? parts[0] : null;
    const hi = parts.length === 2 ? parts[1] : parts[0];
    if (lo != null && Number.isFinite(lo) && lo > facets.priceMin) priceMin = lo;
    if (hi != null && Number.isFinite(hi) && hi < facets.priceMax) priceMax = hi;
  }

  const filters: FilterState = useMemo(
    () => ({
      brand: readFacet('brand'),
      category: readFacet('category'),
      certification: readFacet('certification'),
      color: readFacet('color'),
      size: readFacet('size'),
      priceMin,
      priceMax,
      inStock: searchParams.get(STOCK_PARAM) === '1',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, slugToValue],
  );

  const sortParam = searchParams.get(SORT_PARAM);
  const sort: SortKey = (
    SORT_OPTIONS.some((o) => o.value === sortParam) ? sortParam : DEFAULT_SORT
  ) as SortKey;

  const pageParam = Number(searchParams.get(PAGE_PARAM));
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;

  const mutate = (fn: (p: URLSearchParams) => void, opts?: { replace?: boolean }) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        fn(next);
        return next;
      },
      { replace: opts?.replace ?? false },
    );
  };

  const setFacet = (key: FilterKey, values: string[]) =>
    mutate((p) => {
      const cfg = schemaByKey[key];
      if (!cfg) return;
      const slugs = values.map((v) => valueToSlug[key].get(v) ?? slugify(v));
      if (slugs.length) p.set(cfg.urlParam, slugs.join(','));
      else p.delete(cfg.urlParam);
      p.delete(PAGE_PARAM);
    });

  const toggleFacet = (key: FilterKey, value: string) => {
    const cur = filters[key];
    setFacet(key, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
  };

  const setPriceRange = (min: number | null, max: number | null) =>
    mutate(
      (p) => {
        const lo = min ?? facets.priceMin;
        const hi = max ?? facets.priceMax;
        if (lo <= facets.priceMin && hi >= facets.priceMax) p.delete(PRICE_PARAM);
        else p.set(PRICE_PARAM, `${lo}-${hi}`);
        p.delete(PAGE_PARAM);
      },
      { replace: true },
    );

  const toggleInStock = () =>
    mutate((p) => {
      if (filters.inStock) p.delete(STOCK_PARAM);
      else p.set(STOCK_PARAM, '1');
      p.delete(PAGE_PARAM);
    });

  const setSort = (value: SortKey) =>
    mutate((p) => {
      if (value === DEFAULT_SORT) p.delete(SORT_PARAM);
      else p.set(SORT_PARAM, value);
      p.delete(PAGE_PARAM);
    });

  const setPage = (value: number) =>
    mutate((p) => {
      if (value <= 1) p.delete(PAGE_PARAM);
      else p.set(PAGE_PARAM, String(value));
    });

  const clearAll = () =>
    mutate((p) => {
      for (const cfg of facetConfigs) p.delete(cfg.urlParam);
      p.delete(PRICE_PARAM);
      p.delete(STOCK_PARAM);
      p.delete(PAGE_PARAM);
      // Sort is a view preference, not a filter — keep it through a clear-all.
    });

  const removeChip = (chip: { value?: string }) => {
    const v = chip.value;
    if (!v) return;
    if (v === 'price') return setPriceRange(null, null);
    if (v === 'stock') return toggleInStock();
    const idx = v.indexOf(':');
    const key = v.slice(0, idx) as FilterKey;
    const value = v.slice(idx + 1);
    if (schemaByKey[key]) toggleFacet(key, value);
  };

  const labelFor = (key: FilterKey, value: string): string => {
    if (key === 'color') return facets.color.find((c) => c.value === value)?.label ?? value;
    if (key === 'size') return value.toUpperCase();
    return value;
  };

  const activeChips = useMemo<PlpChip[]>(() => {
    const chips: PlpChip[] = [];
    for (const cfg of facetConfigs) {
      for (const value of filters[cfg.id]) {
        chips.push({ group: cfg.label, label: labelFor(cfg.id, value), value: `${cfg.id}:${value}` });
      }
    }
    if (filters.priceMin != null || filters.priceMax != null) {
      const lo = filters.priceMin ?? facets.priceMin;
      const hi = filters.priceMax ?? facets.priceMax;
      chips.push({ group: 'Price', label: `${formatPrice(lo)} – ${formatPrice(hi)}`, value: 'price' });
    }
    if (filters.inStock) {
      chips.push({ group: 'Availability', label: 'In stock', value: 'stock' });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, facets]);

  return {
    filters,
    sort,
    page,
    priceBounds: { min: facets.priceMin, max: facets.priceMax },
    activeChips,
    activeCount: activeChips.length,
    toggleFacet,
    setFacet,
    setPriceRange,
    toggleInStock,
    setSort,
    setPage,
    removeChip,
    clearAll,
  };
}
