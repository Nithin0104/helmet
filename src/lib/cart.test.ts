import { describe, expect, it } from 'vitest';
import {
  buildSummaryRows,
  computeTotals,
  getSuggested,
  promoRate,
  toDisplayLine,
} from './cart';
import { DEFAULT_ETA, FREE_SHIP_THRESHOLD } from '../data/cart';
import { PRODUCTS } from '../data/products';
import type { CartLine } from '../cart/CartContext';
import type { Product } from '../data/types';

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: 'p|c|s',
    productId: 'p',
    name: 'Test Item',
    brand: 'Apexline',
    price: 1000,
    qty: 1,
    ...overrides,
  };
}

describe('promoRate', () => {
  it('resolves known codes case-insensitively and trims whitespace', () => {
    expect(promoRate('ride10')).toBe(0.1);
    expect(promoRate('  APEX15 ')).toBe(0.15);
  });

  it('returns 0 for unknown or empty codes', () => {
    expect(promoRate('NOPE')).toBe(0);
    expect(promoRate('')).toBe(0);
    expect(promoRate(null)).toBe(0);
    expect(promoRate(undefined)).toBe(0);
  });
});

describe('computeTotals', () => {
  it('returns an all-zero breakdown for an empty bag', () => {
    const t = computeTotals(0);
    expect(t).toMatchObject({ subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 });
    expect(t.freeShipUnlocked).toBe(false);
    expect(t.remainingForFreeShip).toBe(FREE_SHIP_THRESHOLD);
  });

  it('charges flat shipping below the free-ship threshold', () => {
    const t = computeTotals(4998);
    expect(t.freeShipUnlocked).toBe(false);
    expect(t.shipping).toBe(249);
    expect(t.remainingForFreeShip).toBe(1);
    // GST on the full subtotal, total = subtotal + shipping + tax.
    expect(t.tax).toBe(Math.round(4998 * 0.18));
    expect(t.total).toBe(4998 + 249 + t.tax);
  });

  it('unlocks free shipping exactly at the threshold', () => {
    const t = computeTotals(FREE_SHIP_THRESHOLD);
    expect(t.freeShipUnlocked).toBe(true);
    expect(t.shipping).toBe(0);
    expect(t.remainingForFreeShip).toBe(0);
  });

  it('applies a valid promo before shipping and tax', () => {
    const t = computeTotals(10000, 'RIDE10');
    expect(t.appliedRate).toBe(0.1);
    expect(t.discount).toBe(1000);
    expect(t.shipping).toBe(0); // afterDiscount 9000 ≥ threshold
    expect(t.tax).toBe(Math.round(9000 * 0.18));
    expect(t.total).toBe(9000 + t.tax);
  });

  it('ignores an invalid promo code', () => {
    const t = computeTotals(10000, 'NOPE');
    expect(t.appliedRate).toBe(0);
    expect(t.discount).toBe(0);
  });

  it('can drop below the threshold once a discount is applied', () => {
    // 5200 - 15% = 4420 < 4999 → shipping charged again.
    const t = computeTotals(5200, 'APEX15');
    expect(t.discount).toBe(780);
    expect(t.freeShipUnlocked).toBe(false);
    expect(t.shipping).toBe(249);
  });
});

describe('buildSummaryRows', () => {
  it('omits the discount row when no promo applies', () => {
    const rows = buildSummaryRows(computeTotals(2000));
    expect(rows.map((r) => r.label)).toEqual(['Subtotal', 'Delivery', 'GST (18%)']);
  });

  it('includes a good-toned discount row and FREE delivery when applicable', () => {
    const rows = buildSummaryRows(computeTotals(10000, 'RIDE10'), 'RIDE10');
    const discount = rows.find((r) => r.label.startsWith('Discount'));
    expect(discount?.label).toBe('Discount · RIDE10');
    expect(discount?.value.startsWith('−')).toBe(true);
    expect(discount?.tone).toBe('good');
    const delivery = rows.find((r) => r.label === 'Delivery');
    expect(delivery?.value).toBe('FREE');
    expect(delivery?.tone).toBe('good');
  });

  it('shows an em dash for delivery on an empty bag', () => {
    const rows = buildSummaryRows(computeTotals(0));
    expect(rows.find((r) => r.label === 'Delivery')?.value).toBe('—');
  });
});

describe('toDisplayLine', () => {
  it('enriches a line from the catalog (type, swatch, size label, stock)', () => {
    const product = PRODUCTS[0];
    const color = product.colors?.[0];
    const size = product.sizes?.find((s) => typeof s.stock === 'number') ?? product.sizes?.[0];
    const dl = toDisplayLine(
      line({ productId: product.id, name: product.name, color: color?.name, size: size?.id }),
    );

    expect(dl.type).toBe(product.category.toUpperCase());
    expect(dl.model).toBe(product.name);
    expect(dl.eta).toBe(DEFAULT_ETA);
    if (color) expect(dl.colorHex).toBe(color.hex);
    if (size) expect(dl.sizeLabel).toBe(size.label.split(' ')[0]);
    if (size && typeof size.stock === 'number') expect(dl.stock).toBe(size.stock);
  });

  it('degrades gracefully when the product is not in the catalog', () => {
    const dl = toDisplayLine(line({ productId: 'ghost', size: 'm' }));
    expect(dl.type).toBe('ITEM');
    expect(dl.colorHex).toBeUndefined();
    expect(dl.stock).toBeUndefined();
    expect(dl.sizeLabel).toBe('M');
    expect(dl.eta).toBe(DEFAULT_ETA);
  });
});

describe('getSuggested', () => {
  const catalog: Product[] = [
    { id: 'a', name: 'A', brand: 'X', category: 'Visor', price: 100, rating: 5, reviewCount: 1 },
    { id: 'b', name: 'B', brand: 'X', category: 'Gloves', price: 200, rating: 5, reviewCount: 1 },
    { id: 'c', name: 'C', brand: 'X', category: 'Care', price: 300, rating: 5, reviewCount: 1 },
  ];

  it('excludes products already in the cart and caps at the limit', () => {
    const result = getSuggested([line({ productId: 'a' })], catalog, 5);
    expect(result.map((p) => p.id)).toEqual(['b', 'c']);
  });

  it('respects the limit', () => {
    expect(getSuggested([], catalog, 2)).toHaveLength(2);
  });
});
