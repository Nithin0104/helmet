/**
 * Money formatting for the storefront. Prices live in `data/*` as plain integer
 * rupees (the future API contract); components format at the edge so a currency
 * or locale swap is one change here, not a find-and-replace across the UI.
 */
const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** `42999` → `₹42,999`. Pass a preformatted string through untouched. */
export function formatPrice(value: number | string | null | undefined): string {
  if (value == null || value === '') return '₹—';
  if (typeof value === 'string') return value;
  return INR.format(value);
}

/** Compact count: `950` → `950`, `2100` → `2.1k`, `1500000` → `1.5M`. */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  const m = value / 1_000_000;
  return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
}
