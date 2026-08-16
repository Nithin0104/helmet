import type { RefObject } from 'react';
import { Truck, Undo2, ShieldCheck, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QtyStepper, SizeGrid, TrustList, Icon } from '../../../components/primitives';
import { SwatchPicker } from '../../../components/composite';
import { useWishlist } from '../../../wishlist/WishlistContext';
import { formatPrice } from '../../../lib/format';
import { getSku } from '../../../lib/pdp';
import { TRUST_BADGES, SIZE_HELPER, PRICE_NOTE, type TrustIconKey } from '../../../data/pdp';
import type { Product } from '../../../data/types';
import type { CartPhase } from '../ProductPage';
import styles from '../ProductPage.module.css';

const TRUST_ICONS: Record<TrustIconKey, LucideIcon> = {
  delivery: Truck,
  returns: Undo2,
  warranty: ShieldCheck,
  secure: Lock,
};

export interface BuyPanelProps {
  product: Product;
  colorIndex: number;
  onColor: (i: number) => void;
  sizeIndex: number;
  onSize: (i: number) => void;
  qty: number;
  onQty: (n: number) => void;
  cartPhase: CartPhase;
  onAddToCart: () => void;
  onOpenGuide: () => void;
  onGoReviews: () => void;
  /** Attached to the CTA row so the page can show the sticky bar once it scrolls off. */
  ctaRef: RefObject<HTMLDivElement | null>;
}

/** The buy column: identity, price, variant selectors, add-to-cart and trust badges. */
export function BuyPanel({
  product,
  colorIndex,
  onColor,
  sizeIndex,
  onSize,
  qty,
  onQty,
  cartPhase,
  onAddToCart,
  onOpenGuide,
  onGoReviews,
  ctaRef,
}: BuyPanelProps) {
  const { has, toggle } = useWishlist();
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const size = sizes[sizeIndex];
  const rounded = Math.round(product.rating);
  const stars = '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);

  const anyInStock = sizes.length === 0 || sizes.some((s) => s.available);
  const stockState = (() => {
    if (!size) return null;
    const stock = size.stock;
    const available = size.available ?? (stock != null ? stock > 0 : true);
    const low = stock != null && stock > 0 && stock <= 3;
    const shortLabel = size.label.split(' ')[0];
    if (!available) return { tone: styles.dotOut, line: `Sold out in ${shortLabel} — pick another size` };
    if (low) return { tone: styles.dotLow, line: `Only ${stock} left in ${shortLabel}` };
    return { tone: styles.dotOk, line: 'In stock · ships today' };
  })();

  const total = product.price * qty;
  const done = cartPhase === 'done';
  const loading = cartPhase === 'loading';
  const ctaLabel = done
    ? 'Added to cart'
    : loading
      ? 'Adding…'
      : !anyInStock
        ? 'Sold out'
        : `Add to cart — ${formatPrice(total)}`;

  const trustItems = TRUST_BADGES.map((b) => ({
    icon: <Icon icon={TRUST_ICONS[b.icon]} size="sm" />,
    title: b.title,
    sub: b.sub,
  }));

  return (
    <div className={styles.buy}>
      <div className={styles.eyebrowRow}>
        <span className={styles.brand}>{product.brand}</span>
        <span className={styles.sku}>SKU {getSku(product)}</span>
      </div>

      <h1 className={styles.title}>{product.name}</h1>

      <a href="#reviews" className={styles.ratingLink} onClick={(e) => { e.preventDefault(); onGoReviews(); }}>
        <span className={styles.ratingStars}>{stars}</span>
        <span className={styles.ratingNum}>{product.rating}</span>
        <span className={styles.ratingCount}>{product.reviewCount} reviews</span>
      </a>

      <div className={styles.priceRow}>
        <span className={styles.price}>{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <span className={styles.oldPrice}>{formatPrice(product.compareAtPrice)}</span>
        )}
        <span className={styles.priceNote}>{PRICE_NOTE}</span>
      </div>

      {stockState && (
        <div className={styles.stockRow}>
          <span className={`${styles.stockDot} ${stockState.tone}`} aria-hidden />
          <span className={styles.stockLine}>{stockState.line}</span>
        </div>
      )}

      <div className={styles.divider} />

      {colors.length > 0 && (
        <SwatchPicker
          label="Colour"
          items={colors.map((c) => ({ name: c.name, hex: c.hex }))}
          value={colorIndex}
          onChange={onColor}
        />
      )}

      {sizes.length > 0 && (
        <div className={styles.sizeBlock}>
          <SizeGrid
            label="Size"
            // Show just the size code (e.g. "XS") on the tiles — the cm range
            // lives in the size guide. Full label is kept as the accessible name.
            items={sizes.map((s) => ({
              label: s.label,
              shortLabel: s.label.split(' ')[0],
              stock: s.stock,
              available: s.available,
            }))}
            value={sizeIndex}
            onChange={onSize}
            columns="auto"
            helper={SIZE_HELPER}
            onGuide={onOpenGuide}
          />
        </div>
      )}

      <div className={styles.ctaRow} ref={ctaRef}>
        <QtyStepper value={qty} min={1} max={10} onChange={onQty} size="lg" disabled={!anyInStock} />
        <button
          type="button"
          className={`${styles.cta} ${done ? styles.ctaDone : ''}`}
          onClick={onAddToCart}
          disabled={loading || done || !anyInStock}
        >
          {loading && <span className={styles.ctaSpinner} aria-hidden />}
          {done && <span className={styles.ctaCheck} aria-hidden>✓</span>}
          {ctaLabel}
        </button>
      </div>

      <button
        type="button"
        className={styles.wishlistBtn}
        aria-pressed={has(product.id)}
        onClick={() => toggle(product.id)}
      >
        {has(product.id) ? '♥ Saved to wishlist' : '♡ Save to wishlist'}
      </button>

      <div className={styles.trust}>
        <TrustList items={trustItems} layout="stack" />
      </div>
    </div>
  );
}
