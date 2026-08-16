import type { Product } from '../../../data/types';
import styles from '../ProductPage.module.css';

/** The "why this helmet" stat band — big values, or a fallback feature list. */
export function HighlightsBand({ product }: { product: Product }) {
  const stats = product.highlightStats;
  const fallback = product.highlights;
  if (!stats?.length && !fallback?.length) return null;

  return (
    <section className={styles.section} aria-labelledby="pdp-why">
      <div className={styles.eyebrow} id="pdp-why">
        WHY THIS LID
      </div>
      <div className={styles.highlightGrid}>
        {stats?.length
          ? stats.map((h, i) => (
              <div key={i} className={styles.highlightCard}>
                <div className={styles.highlightValue}>{h.value}</div>
                <div className={styles.highlightLabel}>{h.label}</div>
              </div>
            ))
          : fallback!.map((h, i) => (
              <div key={i} className={styles.highlightCard}>
                <div className={styles.highlightLabel}>{h}</div>
              </div>
            ))}
      </div>
    </section>
  );
}
