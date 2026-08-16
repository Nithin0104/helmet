/**
 * PLP catalog logic — pure, framework-agnostic functions over `Product[]` that a
 * future backend can mirror 1:1 (filter/sort/paginate/facets as a query API). This
 * module also holds the accessor registry (how each facet reads a product), the
 * non-serializable half kept out of `src/data/filters.ts`.
 */
import type { Product } from '../data/types';
import type { FilterKey } from '../data/filters';

export type SortKey =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'top-rated'
  | 'best-selling';

export interface FilterState {
  brand: string[];
  category: string[];
  certification: string[];
  color: string[];
  size: string[];
  /** Lower price bound; `null` means no floor (from the catalog min). */
  priceMin: number | null;
  /** Upper price bound; `null` means no cap (up to the catalog max). */
  priceMax: number | null;
  inStock: boolean;
}

export const FILTER_KEYS: FilterKey[] = ['brand', 'category', 'certification', 'color', 'size'];

export const EMPTY_FILTERS: FilterState = {
  brand: [],
  category: [],
  certification: [],
  color: [],
  size: [],
  priceMin: null,
  priceMax: null,
  inStock: false,
};

export interface FacetValue {
  value: string;
  label: string;
  count: number;
}
export interface ColorFacetValue extends FacetValue {
  hex: string;
}

export interface DerivedFacets {
  brand: FacetValue[];
  category: FacetValue[];
  certification: FacetValue[];
  color: ColorFacetValue[];
  size: FacetValue[];
  priceMin: number;
  priceMax: number;
}

/** Canonical size order so the size facet reads XS→XXL, not alphabetically. */
const SIZE_ORDER = ['xs', 's', 'm', 'l', 'xl', 'xxl'];

/** How each facet reads the value(s) a product matches on. */
const FACET_ACCESSORS: Record<FilterKey, (p: Product) => string[]> = {
  brand: (p) => [p.brand],
  category: (p) => [p.category],
  certification: (p) => (p.certification ? [p.certification] : []),
  color: (p) => p.colors?.map((c) => c.id) ?? [],
  size: (p) => p.sizes?.map((s) => s.id) ?? [],
};

/**
 * A product is in stock if an explicit `inStock` flag says so (sizeless catalogs
 * like accessories/spares/care), else if it has no sizes or at least one available
 * size. The explicit flag wins so a sizeless SKU can still be marked sold out.
 */
export function isInStock(p: Product): boolean {
  if (typeof p.inStock === 'boolean') return p.inStock;
  return p.sizes?.some((s) => s.available) ?? true;
}

type IgnoreKey = FilterKey | 'price' | 'inStock';

/** Does a product satisfy every filter, optionally ignoring one (for facet counts)? */
function passes(p: Product, f: FilterState, ignore?: IgnoreKey): boolean {
  for (const key of FILTER_KEYS) {
    if (ignore === key) continue;
    const selected = f[key];
    if (selected.length > 0 && !FACET_ACCESSORS[key](p).some((v) => selected.includes(v))) {
      return false;
    }
  }
  if (ignore !== 'price') {
    if (f.priceMin != null && p.price < f.priceMin) return false;
    if (f.priceMax != null && p.price > f.priceMax) return false;
  }
  if (ignore !== 'inStock' && f.inStock && !isInStock(p)) return false;
  return true;
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((p) => passes(p, filters));
}

/** Rank used by the "Newest" sort — featured-new first, then a `New` badge. */
function newness(p: Product): number {
  return (p.featured === 'new' ? 2 : 0) + (p.badge === 'New' ? 1 : 0);
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'newest':
      return list.sort((a, b) => newness(b) - newness(a));
    case 'top-rated':
      return list.sort((a, b) => b.rating - a.rating);
    case 'best-selling':
      return list.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'featured':
    default:
      return list; // preserve catalog curation order
  }
}

/**
 * Count-aware facet count: how many products a given option would yield, given all
 * OTHER active filters (the same option's own group is ignored so multi-select
 * counts stay meaningful). Mirrors the DC source's `passes(p, ignore)` behaviour.
 */
export function countFor(
  products: Product[],
  filters: FilterState,
  key: FilterKey,
  value: string,
): number {
  return products.filter((p) => passes(p, filters, key) && FACET_ACCESSORS[key](p).includes(value)).length;
}

/**
 * Count-aware counts for every value of every facet in a single sweep per facet
 * (O(facets × products) rather than the O(facets × values × products) of calling
 * `countFor` per option). Memoize this in the UI and read `counts[key].get(value)`.
 */
export function facetCounts(
  products: Product[],
  filters: FilterState,
): Record<FilterKey, Map<string, number>> {
  const result = {} as Record<FilterKey, Map<string, number>>;
  for (const key of FILTER_KEYS) {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!passes(p, filters, key)) continue;
      for (const v of FACET_ACCESSORS[key](p)) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    result[key] = counts;
  }
  return result;
}

function bucket(products: Product[], read: (p: Product) => string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of products) {
    for (const v of read(p)) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

/** Most-populated first, then alphabetical — stable option ordering for the sidebar. */
function byCountThenLabel(a: FacetValue, b: FacetValue): number {
  return b.count - a.count || a.label.localeCompare(b.label);
}

/**
 * Derive the option universe (labels, swatch hex, price bounds) from the full
 * catalog. `count` here is the full-catalog count; the sidebar overrides it with a
 * live `countFor` given the active filters.
 */
export function deriveFacets(products: Product[]): DerivedFacets {
  const simple = (key: 'brand' | 'category' | 'certification'): FacetValue[] =>
    [...bucket(products, FACET_ACCESSORS[key]).entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort(byCountThenLabel);

  const colorCounts = bucket(products, FACET_ACCESSORS.color);
  const colorMeta = new Map<string, { name: string; hex: string }>();
  for (const p of products) {
    for (const c of p.colors ?? []) {
      if (!colorMeta.has(c.id)) colorMeta.set(c.id, { name: c.name, hex: c.hex });
    }
  }
  const color: ColorFacetValue[] = [...colorCounts.entries()]
    .map(([value, count]) => ({
      value,
      label: colorMeta.get(value)?.name ?? value,
      hex: colorMeta.get(value)?.hex ?? '#55555c',
      count,
    }))
    .sort(byCountThenLabel);

  const sizeCounts = bucket(products, FACET_ACCESSORS.size);
  const size: FacetValue[] = [...sizeCounts.entries()]
    .map(([value, count]) => ({ value, label: value.toUpperCase(), count }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.value) - SIZE_ORDER.indexOf(b.value));

  const prices = products.map((p) => p.price);
  return {
    brand: simple('brand'),
    category: simple('category'),
    certification: simple('certification'),
    color,
    size,
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
  };
}

export interface PageResult<T> {
  items: T[];
  pageCount: number;
  total: number;
  /** Clamped current page (1-based). */
  page: number;
  /** 1-based index of the first / last item shown (0 when empty). */
  start: number;
  end: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, page), pageCount);
  const startIdx = (clamped - 1) * pageSize;
  const slice = items.slice(startIdx, startIdx + pageSize);
  return {
    items: slice,
    pageCount,
    total,
    page: clamped,
    start: total === 0 ? 0 : startIdx + 1,
    end: startIdx + slice.length,
  };
}
