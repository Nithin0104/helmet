import { Link, useNavigate } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { formatPrice } from '../../../lib/format';
import { useCart } from '../../../cart/CartContext';
import { useWishlist } from '../../../wishlist/WishlistContext';
import { Icon, SaveButton } from '../../primitives';
import type { Product } from '../../../data/types';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
  /** Add handler. Defaults to adding the product to the cart via `useCart`. */
  onAdd?: (product: Product) => void;
  /** Show the save/wishlist heart (appears on hover). */
  heart?: boolean;
  /** Show the slide-up "quick add" bar on hover. */
  quickAdd?: boolean;
  /** Out-of-stock overlay; disables the add controls. */
  soldOut?: boolean;
  /** Fixed 168px width for horizontal rails. */
  fixedWidth?: boolean;
  /** Grow to fill a flex/grid track (max 280px). */
  grow?: boolean;
  /** Show the safety certification next to the rating (PLP cards). */
  showCertification?: boolean;
  /**
   * Wrap the product name in a heading of this level (e.g. `2` on the PLP so each
   * product is an `h2` under the page `h1`). Omit for a plain link (rails).
   */
  headingLevel?: 2 | 3;
  className?: string;
}

/** Catalog tile: shimmer placeholder image, meta, price, and add-to-cart. */
export function ProductCard({
  product,
  onAdd,
  heart = false,
  quickAdd = false,
  soldOut = false,
  fixedWidth = false,
  grow = false,
  showCertification = false,
  headingLevel,
  className,
}: ProductCardProps) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const { id, name, brand, category, price, compareAtPrice, rating, reviewCount, badge, certification } =
    product;

  const typeLabel = (category || 'Helmet').toUpperCase();
  const lightBadge = badge === 'New';
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  const Heading = headingLevel === 2 ? 'h2' : headingLevel === 3 ? 'h3' : null;
  /** Helmets carry colour/size variants; accessories don't. */
  const hasVariants = Boolean(product.colors?.length || product.sizes?.length);
  const addLabel = hasVariants ? `Choose options for ${name}` : `Add ${name} to cart`;

  const handleAdd = () => {
    if (soldOut) return;
    // Escape hatch first, so callers can fully override the behaviour.
    if (onAdd) {
      onAdd(product);
      return;
    }
    // Variant products can't be added blind — send the rider to the PDP to pick
    // a colour/size rather than creating an under-specified cart line.
    if (hasVariants) {
      navigate(`/product/${id}`);
      return;
    }
    add({ productId: id, name, brand, price });
  };

  return (
    <div
      className={cx(
        styles.card,
        fixedWidth && styles.fixed,
        grow && styles.grow,
        className,
      )}
    >
      <div className={styles.media}>
        <div className={styles.shimmer} aria-hidden />
        <span className={styles.typeTag}>[ {typeLabel} ]</span>

        {badge && (
          <span className={cx(styles.badge, lightBadge && styles.badgeLight)}>{badge}</span>
        )}

        {heart && (
          <SaveButton
            className={styles.heart}
            saved={has(id)}
            onToggle={() => toggle(id)}
            label={name}
          />
        )}

        {soldOut && (
          <div className={styles.soldOut}>
            <span className={styles.soldOutTag}>OUT OF STOCK</span>
          </div>
        )}

        {quickAdd && !soldOut && (
          <button type="button" className={styles.quickAdd} onClick={handleAdd}>
            {hasVariants ? 'SELECT OPTIONS' : '+ QUICK ADD'}
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.brand}>{brand}</div>
        {Heading ? (
          <Heading className={styles.nameHeading}>
            <Link to={`/product/${id}`} className={styles.name}>
              {name}
            </Link>
          </Heading>
        ) : (
          <Link to={`/product/${id}`} className={styles.name}>
            {name}
          </Link>
        )}

        <div className={styles.rating}>
          <span className={styles.srOnly}>
            Rated {rating.toFixed(1)} out of 5, {reviewCount} reviews
          </span>
          <Icon icon={Star} size="sm" className={styles.stars} />
          <span aria-hidden className={styles.ratingValue}>
            {rating.toFixed(1)}
          </span>
          <span aria-hidden className={styles.reviewCount}>
            ({reviewCount})
          </span>
          {showCertification && certification && (
            <span className={styles.cert}>{certification}</span>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{formatPrice(price)}</span>
            {hasDiscount && (
              <>
                <span className={styles.compareAt}>{formatPrice(compareAtPrice)}</span>
                <span className={styles.discount}>-{discountPct}%</span>
              </>
            )}
          </div>
          <button
            type="button"
            className={styles.add}
            aria-label={addLabel}
            onClick={handleAdd}
            disabled={soldOut}
          >
            <Icon icon={Plus} strokeWidth={2.4} className={styles.addIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
