import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import { formatPrice } from '../../../lib/format';
import { useCart } from '../../../cart/CartContext';
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
  className,
}: ProductCardProps) {
  const { add } = useCart();
  const { id, name, brand, category, price, rating, reviewCount, badge } = product;

  const typeLabel = (category || 'Helmet').toUpperCase();
  const lightBadge = badge === 'New';

  const handleAdd = () => {
    if (soldOut) return;
    if (onAdd) onAdd(product);
    else add({ productId: id, name, brand, price });
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
          <button type="button" className={styles.heart} aria-label={`Save ${name}`}>
            ♡
          </button>
        )}

        {soldOut && (
          <div className={styles.soldOut}>
            <span className={styles.soldOutTag}>OUT OF STOCK</span>
          </div>
        )}

        {quickAdd && !soldOut && (
          <button type="button" className={styles.quickAdd} onClick={handleAdd}>
            + QUICK ADD
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.brand}>{brand}</div>
        <Link to={`/product/${id}`} className={styles.name}>
          {name}
        </Link>

        <div className={styles.rating}>
          <span className={styles.stars} aria-hidden>
            ★
          </span>
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
          <span className={styles.reviewCount}>({reviewCount})</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(price)}</span>
          <button
            type="button"
            className={styles.add}
            aria-label={`Add ${name} to cart`}
            onClick={handleAdd}
            disabled={soldOut}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
