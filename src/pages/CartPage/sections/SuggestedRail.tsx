import { Plus } from 'lucide-react';
import { Icon } from '../../../components/primitives';
import { useDragScroll } from '../../../hooks/useDragScroll';
import { formatPrice } from '../../../lib/format';
import type { Product } from '../../../data/types';
import styles from './SuggestedRail.module.css';

export interface SuggestedRailProps {
  items: Product[];
  /** Quick-add an add-on to the bag. */
  onAdd: (product: Product) => void;
  heading?: string;
}

/**
 * "Suggested for you" — a horizontally scrollable rail of add-on mini cards with
 * a quick-add button, prev/next controls and drag-to-scroll. Renders nothing
 * when there's nothing to suggest.
 */
export function SuggestedRail({ items, onAdd, heading = 'SUGGESTED FOR YOU' }: SuggestedRailProps) {
  const railRef = useDragScroll<HTMLUListElement>();

  if (!items.length) return null;

  const scrollByDir = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className={styles.root} aria-label="Suggested add-ons">
      <div className={styles.head}>
        <div className={styles.eyebrow}>{heading}</div>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Scroll left"
            onClick={() => scrollByDir(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Scroll right"
            onClick={() => scrollByDir(1)}
          >
            ›
          </button>
        </div>
      </div>

      <ul className={styles.track} ref={railRef}>
        {items.map((p) => (
          <li className={styles.card} key={p.id}>
            <div className={styles.media} aria-hidden>
              <span className={styles.mediaTag}>[ {p.category.toUpperCase()} ]</span>
            </div>
            <div className={styles.info}>
              <div className={styles.brand}>{p.brand}</div>
              <div className={styles.model}>{p.name}</div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{formatPrice(p.price)}</span>
                <button
                  type="button"
                  className={styles.addBtn}
                  aria-label={`Add ${p.name} to bag`}
                  onClick={() => onAdd(p)}
                >
                  <Icon icon={Plus} size="sm" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
