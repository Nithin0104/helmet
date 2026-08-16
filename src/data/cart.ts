/**
 * Cart / checkout configuration — the future-API seam for pricing rules and the
 * static reassurance copy the bag renders. Kept as plain data (no runtime state)
 * so `src/lib/cart.ts` can stay pure and a real pricing service can drop in later
 * by swapping these constants (or fetching them) without touching the UI.
 *
 * Prices are integer rupees, matching the rest of `src/data/*`.
 */

/** Cart subtotal (after discount) at or above which delivery is free. */
export const FREE_SHIP_THRESHOLD = 4999;

/** Flat delivery fee applied below the free-shipping threshold. */
export const FLAT_SHIPPING = 249;

/** GST rate applied to the post-discount subtotal (India, 18%). */
export const GST_RATE = 0.18;

export interface Promo {
  /** Fractional discount off the subtotal, e.g. `0.1` = 10%. */
  rate: number;
  /** Human label shown in the summary discount row / applied message. */
  label: string;
}

/** Accepted promo codes. Keys are compared upper-cased. */
export const PROMOS: Record<string, Promo> = {
  RIDE10: { rate: 0.1, label: '10% off' },
  APEX15: { rate: 0.15, label: '15% off' },
};

/** Accepted payment rails, shown as chips under the checkout button. */
export const PAY_METHODS = ['UPI', 'VISA', 'MASTERCARD', 'RUPAY', 'NETBANKING'];

/** Reassurance badges under the order summary. `icon` is a glyph (a valid ReactNode). */
export const CART_TRUST = [
  { icon: '✓', title: 'Secure encrypted checkout', sub: '256-bit TLS · PCI-DSS' },
  { icon: '↺', title: '30-day free returns', sub: 'Unused, with tags and box' },
  { icon: '✦', title: 'Genuine brand warranty', sub: 'Sourced direct from brands' },
];

/** Rotating announcement strip messages for the bag (delivery / returns / certs). */
export const CART_ANNOUNCEMENTS = [
  '★ FREE DELIVERY OVER ₹4,999',
  '★ 30-DAY RETURNS',
  '★ ISI + ECE 22.06 CERTIFIED',
];

/** Fallback delivery estimate when a line's product carries no specific ETA. */
export const DEFAULT_ETA = 'Arrives in 3–5 working days';

/** How many add-on suggestions the "Suggested for you" rail shows. */
export const SUGGESTED_LIMIT = 6;
