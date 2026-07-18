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
