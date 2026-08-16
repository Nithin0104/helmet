/**
 * Pure cart pricing + presentation helpers. No React, no storage — everything a
 * component needs is derived here from the cart lines plus the `data/cart` config
 * and the product catalog, so the maths is unit-testable in isolation and the
 * page stays declarative. Mirrors the DC `Helmet Cart` renderVals() calculation.
 */
import type { CartLine } from '../cart/CartContext';
import type { Product } from '../data/types';
import { getProduct } from '../data/products';
import { getAccessory } from '../data/accessories';
import {
  FLAT_SHIPPING,
  FREE_SHIP_THRESHOLD,
  GST_RATE,
  PROMOS,
  DEFAULT_ETA,
} from '../data/cart';
import { formatPrice } from './format';

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  /** Post-discount subtotal qualifies for free delivery. */
  freeShipUnlocked: boolean;
  /** Rupees left to reach the free-delivery threshold (0 once met). */
  remainingForFreeShip: number;
  /** Fractional discount actually applied (0 when no valid code). */
  appliedRate: number;
}

/** Look up a promo's discount rate; unknown/empty codes yield 0. */
export function promoRate(code?: string | null): number {
  if (!code) return 0;
  return PROMOS[code.trim().toUpperCase()]?.rate ?? 0;
}

/**
 * Compute the money breakdown from a subtotal and an optional promo code.
 * Discount comes off the subtotal, delivery is free once the post-discount
 * subtotal clears the threshold (or the bag is empty), GST applies to the
 * post-discount subtotal. Config is injectable for tests but defaults to
 * `data/cart`.
 */
export function computeTotals(
  subtotal: number,
  code?: string | null,
  config: {
    threshold?: number;
    flatShipping?: number;
    gstRate?: number;
  } = {},
): CartTotals {
  const threshold = config.threshold ?? FREE_SHIP_THRESHOLD;
  const flatShipping = config.flatShipping ?? FLAT_SHIPPING;
  const gstRate = config.gstRate ?? GST_RATE;

  const appliedRate = promoRate(code);
  const discount = Math.round(subtotal * appliedRate);
  const afterDiscount = subtotal - discount;
  const isEmpty = subtotal <= 0;

  const freeShipUnlocked = afterDiscount >= threshold;
  const shipping = freeShipUnlocked || isEmpty ? 0 : flatShipping;
  const tax = Math.round(afterDiscount * gstRate);
  const total = afterDiscount + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    freeShipUnlocked,
    remainingForFreeShip: Math.max(0, threshold - subtotal),
    appliedRate,
  };
}

export type SummaryTone = 'good' | 'muted' | 'warn' | 'accent';

export interface SummaryRow {
  label: string;
  value: string;
  tone?: SummaryTone;
}

/** Build the labelled summary rows (subtotal / discount / delivery / GST). */
export function buildSummaryRows(totals: CartTotals, code?: string | null): SummaryRow[] {
  const hasDiscount = totals.discount > 0;
  const isEmpty = totals.subtotal <= 0;
  const appliedCode = code?.trim().toUpperCase();

  return [
    { label: 'Subtotal', value: formatPrice(totals.subtotal) },
    ...(hasDiscount
      ? [
          {
            label: `Discount · ${appliedCode}`,
            value: `−${formatPrice(totals.discount)}`,
            tone: 'good' as const,
          },
        ]
      : []),
    {
      label: 'Delivery',
      value: isEmpty ? '—' : totals.freeShipUnlocked ? 'FREE' : formatPrice(totals.shipping),
      tone: totals.freeShipUnlocked && !isEmpty ? ('good' as const) : undefined,
    },
    { label: 'GST (18%)', value: formatPrice(totals.tax) },
  ];
}

export interface DisplayLine extends CartLine {
  /** Catalog category, upper-cased for the tile label (e.g. `HELMET`). */
  type: string;
  /** Product/model name (alias of `name`, matching the DC field). */
  model: string;
  /** Resolved swatch hex for the colour dot, when the catalog knows the colour. */
  colorHex?: string;
  /** Short size label (e.g. `M`, `One size`), resolved from the size id. */
  sizeLabel?: string;
  /** Units in stock for this variant, when the catalog exposes it. */
  stock?: number;
  /** Delivery estimate copy. */
  eta: string;
}

function lookup(productId: string): Product | undefined {
  return getProduct(productId) ?? getAccessory(productId);
}

/**
 * Enrich a raw cart line with the display-only fields the catalog owns but the
 * cart line doesn't persist (type, colour swatch, live stock, size label, ETA).
 * Degrades gracefully when the product is missing from the catalog — a real
 * fetch layer would resolve these the same way.
 */
export function toDisplayLine(line: CartLine): DisplayLine {
  const product = lookup(line.productId);
  const colorHex = product?.colors?.find((c) => c.name === line.color)?.hex;
  const sizeMatch = product?.sizes?.find((s) => s.id === line.size);
  const sizeLabel = sizeMatch?.label.split(' ')[0] ?? (line.size ? line.size.toUpperCase() : undefined);

  return {
    ...line,
    type: (product?.category ?? '').toUpperCase() || 'ITEM',
    model: line.name,
    colorHex,
    sizeLabel,
    stock: sizeMatch?.stock,
    eta: DEFAULT_ETA,
  };
}

/**
 * Add-on suggestions for the bag: catalog products not already in the cart,
 * capped at `limit`. Excludes anything whose productId is already a line.
 */
export function getSuggested(lines: CartLine[], catalog: Product[], limit: number): Product[] {
  const inCart = new Set(lines.map((l) => l.productId));
  return catalog.filter((p) => !inCart.has(p.id)).slice(0, limit);
}
