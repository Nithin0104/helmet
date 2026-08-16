/**
 * PLP filter configuration — the serializable seam a real facet API would return.
 * It holds only data (no functions): which facets exist, how they render, and how
 * they map to URL params. The logic that reads a `Product` for each facet lives in
 * `src/lib/catalog.ts` (the accessor registry), so this file stays JSON-shaped and
 * a backend can drop a facet response into the same shape later.
 */

export type FilterKey = 'brand' | 'category' | 'certification' | 'color' | 'size';

export interface FacetConfig {
  /** Product field this facet reads (via the catalog accessor registry). */
  id: FilterKey;
  /** Sidebar heading. */
  label: string;
  /** How `FilterGroup` renders the options. */
  variant: 'checkbox' | 'swatch' | 'pill';
  /** Query-string key, e.g. `type` for category. */
  urlParam: string;
  /** Show the in-facet search box (long option lists). */
  searchable?: boolean;
  /**
   * Scope this facet's options to another facet's current selection: only values
   * still reachable are shown, with an "IN N <group>" note in the header. Used by
   * the Accessories / Spares & Care brand facet to scope brands to the chosen
   * categories (matches the DC source); unset = show the full option universe.
   */
  scopedBy?: FilterKey;
}

/** Order here is the sidebar order. */
export const FILTER_SCHEMA: FacetConfig[] = [
  { id: 'brand', label: 'Brand', variant: 'checkbox', urlParam: 'brand', searchable: true },
  { id: 'category', label: 'Helmet Type', variant: 'checkbox', urlParam: 'type', searchable: true },
  { id: 'certification', label: 'Safety Rating', variant: 'checkbox', urlParam: 'cert' },
  { id: 'color', label: 'Colour', variant: 'swatch', urlParam: 'color' },
  { id: 'size', label: 'Size', variant: 'pill', urlParam: 'size' },
];

/** URL params for the non-facet controls, kept next to the facet params. */
export const PRICE_PARAM = 'price';
export const STOCK_PARAM = 'stock';
export const SORT_PARAM = 'sort';
export const PAGE_PARAM = 'page';

export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'best-selling', label: 'Best Selling' },
];

export const DEFAULT_SORT = 'featured';

/** Grid page size — desktop shows 9, mobile 8 (matches the DC source). */
export const PAGE_SIZE = 9;
export const PAGE_SIZE_MOBILE = 8;

/** In-grid promo cell, injected once on page 1. */
export const PLP_PROMO = {
  kicker: 'SHOWROOM EXCLUSIVE',
  headline: 'Trade in your old lid — 15% off any track helmet.',
  ctaLabel: 'Book a fitting',
  ctaHref: '/helmets',
};

/** 0-based grid slot the promo occupies on page 1 (desktop / mobile). */
export const PROMO_INDEX = 6;
export const PROMO_INDEX_MOBILE = 4;
