/**
 * Site-wide Product Detail Page content — the copy and reference tables that are
 * the same for every helmet (trust promises, the head-measurement size chart,
 * helper/price microcopy, tab labels). Per-product content lives on the `Product`
 * itself (`data/products.ts`); this is the shared PDP chrome, kept as data so it's
 * one edit here, not hardcoded inside the page.
 */

/** Which trust promise an icon slot maps to — the page resolves these to icons. */
export type TrustIconKey = 'delivery' | 'returns' | 'warranty' | 'secure';

export interface TrustBadge {
  icon: TrustIconKey;
  title: string;
  sub: string;
}

/** Delivery / returns / warranty reassurances shown under the buy button. */
export const TRUST_BADGES: TrustBadge[] = [
  { icon: 'delivery', title: 'Express delivery', sub: 'Order before 2pm for next-day dispatch' },
  { icon: 'returns', title: '15-day returns', sub: 'Unworn, tags attached — full refund' },
  { icon: 'warranty', title: 'Genuine warranty', sub: 'Every helmet covered by the brand warranty' },
];

/** Head-circumference size chart shared across the adult size ladder. */
export const SIZE_GUIDE: { columns: string[]; rows: string[][] } = {
  columns: ['Size', 'Head (cm)', 'Hat'],
  rows: [
    ['XS', '53–54', '6¾'],
    ['S', '55–56', '7'],
    ['M', '57–58', '7¼'],
    ['L', '59–60', '7½'],
    ['XL', '61–62', '7¾'],
    ['XXL', '63–64', '8'],
  ],
};

/** One-line measuring tip shown under the size selector. */
export const SIZE_HELPER =
  'Measure around the widest part of your head, ~1cm above the eyebrows. Between two sizes? Size down.';

/** Reassurance under the price. */
export const PRICE_NOTE = 'Tax included · Free delivery over ₹1,499';

/** Detail-tab labels, in order. Tabs with no data are hidden by the page. */
export const PDP_TABS = ['Description', 'Specs', 'Reviews'] as const;
