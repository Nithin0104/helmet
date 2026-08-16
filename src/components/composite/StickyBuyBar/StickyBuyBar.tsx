import { cx } from '../../../lib/cx';
import styles from './StickyBuyBar.module.css';

export type StickyBuyBarPhase = 'idle' | 'loading' | 'done';

export interface StickyBuyBarProps {
  /** Preformatted total price (e.g. "₹42,999"). */
  price: string;
  /** Selection summary, e.g. "Matte Black · Size L · Qty 1". */
  meta?: string;
  /** CTA label in the idle phase. @default 'Add to cart' */
  label?: string;
  phase?: StickyBuyBarPhase;
  /** Slide the bar into view. @default true */
  visible?: boolean;
  /** Also show on desktop (defaults to mobile-only, hidden ≥800px). @default false */
  desktop?: boolean;
  onAdd?: () => void;
  className?: string;
}

/**
 * Fixed bottom buy bar that slides in when the main add-to-cart CTA scrolls off
 * screen. Mobile-only by default; `desktop` keeps it on wide viewports too. When
 * hidden it's inert (aria-hidden + not focusable) so it never becomes a phantom
 * tab stop.
 */
export function StickyBuyBar({
  price,
  meta,
  label = 'Add to cart',
  phase = 'idle',
  visible = true,
  desktop = false,
  onAdd,
  className,
}: StickyBuyBarProps) {
  const loading = phase === 'loading';
  const done = phase === 'done';
  const ctaLabel = done ? 'Added' : loading ? 'Adding…' : label;

  return (
    <div
      className={cx(styles.bar, !desktop && styles.mobileOnly, visible ? styles.in : styles.out, className)}
      aria-hidden={!visible}
    >
      <div className={styles.info}>
        <span className={styles.price}>{price}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      <button
        type="button"
        className={cx(styles.cta, done && styles.ctaDone)}
        onClick={onAdd}
        disabled={loading || done}
        tabIndex={visible ? 0 : -1}
      >
        {loading && <span className={styles.spinner} aria-hidden />}
        {done && <span className={styles.check} aria-hidden>✓</span>}
        {ctaLabel}
      </button>
    </div>
  );
}
