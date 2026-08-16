/**
 * PLP registry — one config per product-listing page. `ShopPage` is a pure
 * function of the entry it's handed, so a new category PLP is a config entry +
 * a route, not a new page. Copy, dataset and the ordered filter rail all live
 * here (content-is-data); the filter/sort/paginate engine (`src/lib/catalog.ts`)
 * is already dataset-agnostic and its `FilterKey` union is a superset, so pages
 * that use only category + brand simply leave the other facets empty.
 */
import type { Product } from './types';
import type { FacetConfig, SortOption } from './filters';
import { SORT_OPTIONS, PLP_PROMO } from './filters';
import { PRODUCTS } from './products';
import { ACCESSORIES } from './accessories';
import { SPARES } from './spares';
import { CARE } from './care';

/** One control in the filter rail, in render order. */
export type PlpFilter =
  | ({ kind: 'facet' } & FacetConfig)
  | { kind: 'price'; label: string }
  | { kind: 'stock'; label: string };

export type PlpSlug = 'helmets' | 'accessories' | 'spares-care';

export interface PlpConfig {
  slug: PlpSlug;
  /** Route path this PLP renders at. */
  path: string;
  /** Trailing breadcrumb label (after Home). */
  breadcrumb: string;
  /** `<h1>` and document title. */
  title: string;
  subtitle: string;
  metaDescription: string;
  /** Noun for the result count and empty state, e.g. "helmets". */
  countNoun: string;
  /** The catalog this page lists. */
  products: Product[];
  /** Sort menu (shared across pages today). */
  sortOptions: SortOption[];
  /** Ordered filter rail — facets interleaved with price/stock. First is open. */
  filters: PlpFilter[];
  /** Optional in-grid promo cell (page 1 only). */
  promo?: typeof PLP_PROMO;
}

/** Reusable stock toggle control (identical across pages). */
const STOCK_FILTER: PlpFilter = { kind: 'stock', label: 'In stock only' };
const PRICE_FILTER: PlpFilter = { kind: 'price', label: 'Price' };

export const PLP_CONFIGS: Record<PlpSlug, PlpConfig> = {
  helmets: {
    slug: 'helmets',
    path: '/helmets',
    breadcrumb: 'Helmets',
    title: 'Helmets',
    subtitle: 'Track, touring, adventure and street lids from every brand we stock.',
    metaDescription:
      'Shop full-face, modular, adventure, touring and open-face helmets from every ' +
      'brand APEXLINE stocks — filter by brand, price, safety rating, colour and size.',
    countNoun: 'helmets',
    products: PRODUCTS,
    sortOptions: SORT_OPTIONS,
    promo: PLP_PROMO,
    filters: [
      { kind: 'facet', id: 'brand', label: 'Brand', variant: 'checkbox', urlParam: 'brand', searchable: true },
      PRICE_FILTER,
      { kind: 'facet', id: 'category', label: 'Helmet Type', variant: 'checkbox', urlParam: 'type', searchable: true },
      { kind: 'facet', id: 'certification', label: 'Safety Rating', variant: 'checkbox', urlParam: 'cert' },
      { kind: 'facet', id: 'color', label: 'Colour', variant: 'swatch', urlParam: 'color' },
      { kind: 'facet', id: 'size', label: 'Size', variant: 'pill', urlParam: 'size' },
      STOCK_FILTER,
    ],
  },
  accessories: {
    slug: 'accessories',
    path: '/accessories',
    breadcrumb: 'Accessories',
    title: 'Accessories',
    subtitle: 'Gloves, jackets, boots, comms, luggage and everything else for the ride.',
    metaDescription:
      'Shop motorcycle accessories at APEXLINE — gloves, jackets, boots, riding jeans, ' +
      'intercoms, luggage and rain gear. Filter by category, brand and price.',
    countNoun: 'accessories',
    products: ACCESSORIES,
    sortOptions: SORT_OPTIONS,
    filters: [
      { kind: 'facet', id: 'category', label: 'Category', variant: 'checkbox', urlParam: 'cat', searchable: true },
      { kind: 'facet', id: 'brand', label: 'Brand', variant: 'checkbox', urlParam: 'brand', searchable: true, scopedBy: 'category' },
      PRICE_FILTER,
      STOCK_FILTER,
    ],
  },
  'spares-care': {
    slug: 'spares-care',
    path: '/spares-care',
    breadcrumb: 'Spares & Care',
    title: 'Spares & Care',
    subtitle: 'Visors, Pinlock inserts, liners, vents and the kit to keep them fresh.',
    metaDescription:
      'Shop helmet spares and care at APEXLINE — replacement visors, Pinlock inserts, ' +
      'comfort liners, vents and cleaning kit. Filter by category, brand and price.',
    countNoun: 'items',
    products: [...SPARES, ...CARE],
    sortOptions: SORT_OPTIONS,
    filters: [
      { kind: 'facet', id: 'category', label: 'Category', variant: 'checkbox', urlParam: 'cat', searchable: true },
      { kind: 'facet', id: 'brand', label: 'Brand', variant: 'checkbox', urlParam: 'brand', searchable: true, scopedBy: 'category' },
      PRICE_FILTER,
      STOCK_FILTER,
    ],
  },
};

/** The facet-kind entries of a PLP's filter rail (what the URL/facets engine needs). */
export function facetConfigsOf(config: PlpConfig): FacetConfig[] {
  return config.filters
    .filter((f): f is { kind: 'facet' } & FacetConfig => f.kind === 'facet')
    .map(({ kind: _kind, ...facet }) => facet);
}
