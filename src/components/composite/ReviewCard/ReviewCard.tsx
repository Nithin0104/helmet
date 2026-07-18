import { cx } from '../../../lib/cx';
import type { Review } from '../../../data/types';
import styles from './ReviewCard.module.css';

export interface ReviewCardProps {
  review: Review;
  /** Product/helmet model shown after the author (e.g. "Velocity RS"). */
  model?: string;
  /** Fixed 250px width for horizontal rails (default); false = fill container. */
  fixedWidth?: boolean;
  className?: string;
}

function stars(rating: number): string {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
}

/** A single customer review: star row, quote, and attribution. */
export function ReviewCard({ review, model, fixedWidth = true, className }: ReviewCardProps) {
  const { author, rating, title, body, verified } = review;

  return (
    <article className={cx(styles.card, fixedWidth ? styles.fixed : styles.fluid, className)}>
      <div className={styles.stars} role="img" aria-label={`${Math.round(rating)} out of 5 stars`}>
        {stars(rating)}
      </div>
      {title && <div className={styles.title}>{title}</div>}
      <p className={styles.quote}>{body}</p>
      <div className={styles.meta}>
        {author}
        {model ? ` · ${model}` : ''}
        {verified && <span className={styles.verified}> · ✓ Verified</span>}
      </div>
    </article>
  );
}
