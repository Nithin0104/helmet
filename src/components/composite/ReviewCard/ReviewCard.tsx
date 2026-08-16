import { Check, Star } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../../primitives';
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

/** A single customer review: star row, quote, and attribution. */
export function ReviewCard({ review, model, fixedWidth = true, className }: ReviewCardProps) {
  const { author, rating, title, body, verified } = review;
  const filled = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <article className={cx(styles.card, fixedWidth ? styles.fixed : styles.fluid, className)}>
      <div className={styles.stars} role="img" aria-label={`${filled} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} icon={Star} size="sm" className={cx(styles.star, i < filled && styles.starFilled)} />
        ))}
      </div>
      {title && <div className={styles.title}>{title}</div>}
      <p className={styles.quote}>{body}</p>
      <div className={styles.meta}>
        {author}
        {model ? ` · ${model}` : ''}
        {verified && (
          <span className={styles.verified}>
            {' · '}
            <Icon icon={Check} size="sm" /> Verified
          </span>
        )}
      </div>
    </article>
  );
}
