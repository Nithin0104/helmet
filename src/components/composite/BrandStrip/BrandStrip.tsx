import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import { BRANDS } from '../../../data/navigation';
import styles from './BrandStrip.module.css';

export interface BrandStripProps {
  brands?: string[];
  /** Small caption above the row; empty string hides it. */
  label?: string;
  /** Seconds for one full loop (default 26). */
  speed?: number;
  className?: string;
}

/** Auto-scrolling row of stockist brand tiles for the home page. */
export function BrandStrip({
  brands = BRANDS,
  label = 'STOCKISTS OF 10+ BRANDS',
  speed = 26,
  className,
}: BrandStripProps) {
  // Duplicate the list so the -50% translate loops seamlessly.
  const loop = [...brands, ...brands];

  return (
    <section className={cx(styles.strip, className)} aria-label={label || 'Stocked brands'}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.viewport}>
        <div className={styles.track} style={{ '--speed': `${speed}s` } as CSSProperties}>
          {loop.map((name, i) => (
            <div key={`${name}-${i}`} className={styles.tile} aria-hidden={i >= brands.length}>
              <span className={styles.name}>{name}</span>
              <span className={styles.logoTag}>[ LOGO ]</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
