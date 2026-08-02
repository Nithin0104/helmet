import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // Copies of `brands` per half of the track. The doubled-track -50% loop only
  // stays gap-free while a half is at least as wide as the viewport — a short
  // brand list's natural width can be much narrower than a wide screen, which
  // opens a visible gap on the right (and a hard jump-cut) just before the
  // loop wraps. Measure and repeat enough copies to cover it, falling back to
  // 1 (matching the old fixed-double behavior) when measurement isn't
  // available yet (first paint, or jsdom in tests).
  const [copies, setCopies] = useState(1);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    const recalc = () => {
      const setWidth = measure.scrollWidth;
      const viewportWidth = viewport.clientWidth;
      if (setWidth <= 0 || viewportWidth <= 0) return;
      setCopies(Math.max(1, Math.ceil(viewportWidth / setWidth) + 1));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [brands]);

  const half = Array.from({ length: copies }, () => brands).flat();
  const loop = [...half, ...half];

  return (
    <section className={cx(styles.strip, className)} aria-label={label || 'Stocked brands'}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.measure} ref={measureRef} aria-hidden="true">
          {brands.map((name, i) => (
            <div key={`measure-${name}-${i}`} className={styles.tile}>
              <span className={styles.name}>{name}</span>
              <span className={styles.logoTag}>[ LOGO ]</span>
            </div>
          ))}
        </div>
        <div
          className={styles.track}
          data-testid="brand-track"
          style={{ '--speed': `${speed}s` } as CSSProperties}
        >
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
