import { useEffect, useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './ReviewSummary.module.css';

export interface ReviewSummaryBucket {
  /** Star value, 1–5. */
  n: number;
  count: number;
}

export interface ReviewSummaryProps {
  /** Average score, 0–5. */
  score: number;
  /** Total review count shown under the score (defaults to the distribution sum). */
  count?: number;
  distribution: ReviewSummaryBucket[];
  className?: string;
}

/**
 * Review aggregate: a large average score, star row, and an animated
 * rating-distribution histogram. Bars grow on mount; the growth is disabled under
 * `prefers-reduced-motion`. The histogram carries a descriptive `aria-label`.
 */
export function ReviewSummary({ score, count, distribution, className }: ReviewSummaryProps) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 120);
    return () => clearTimeout(t);
  }, []);

  const total = distribution.reduce((a, d) => a + d.count, 0) || 1;
  const rounded = Math.round(score);
  const reviewTotal = count ?? total;

  const ariaLabel =
    `Average ${score} out of 5 from ${reviewTotal} reviews. ` +
    distribution.map((d) => `${d.count} rated ${d.n} stars`).join(', ') + '.';

  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.scoreCol}>
        <div className={styles.score}>{score}</div>
        <div className={styles.starRow} aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={cx(styles.star, i < rounded && styles.starOn)}>
              ★
            </span>
          ))}
        </div>
        <div className={styles.count}>{reviewTotal} REVIEWS</div>
      </div>

      <div className={styles.bars} role="img" aria-label={ariaLabel}>
        {distribution.map((d) => {
          const pct = grown ? Math.round((d.count / total) * 100) : 0;
          const tone = d.n >= 4 ? styles.fillHigh : d.n === 3 ? styles.fillMid : styles.fillLow;
          return (
            <div key={d.n} className={styles.barRow}>
              <span className={styles.barStar}>{d.n}★</span>
              <div className={styles.track}>
                <div className={cx(styles.fill, tone)} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.barCount}>{d.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
