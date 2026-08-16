import { cx } from '../../../lib/cx';
import styles from './ProductReview.module.css';

export interface ProductReviewProps {
  author: string;
  date?: string;
  /** 1–5. @default 5 */
  rating?: number;
  title?: string;
  body?: string;
  /** Show the "Verified purchase" badge. @default true */
  verified?: boolean;
  /** Extra context, e.g. "Size L · Matte Black". */
  meta?: string;
  /** Avatar background colour. @default the current accent */
  avatarColor?: string;
  className?: string;
}

/** A single full-width customer review row: avatar, stars, verified badge and body. */
export function ProductReview({
  author,
  date,
  rating = 5,
  title,
  body,
  verified = true,
  meta,
  avatarColor,
  className,
}: ProductReviewProps) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  const stars = '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  const initial = author.charAt(0).toUpperCase();

  return (
    <article className={cx(styles.card, className)}>
      <div className={styles.head}>
        <div className={styles.who}>
          <span
            className={styles.avatar}
            aria-hidden
            style={avatarColor ? ({ background: avatarColor } as React.CSSProperties) : undefined}
          >
            {initial}
          </span>
          <div className={styles.whoText}>
            <div className={styles.author}>{author}</div>
            <div className={styles.stars} role="img" aria-label={`${r} out of 5 stars`}>
              {stars}
            </div>
          </div>
        </div>
        {date && <span className={styles.date}>{date}</span>}
      </div>
      {title && <div className={styles.title}>{title}</div>}
      {body && <p className={styles.body}>{body}</p>}
      {(verified || meta) && (
        <div className={styles.footer}>
          {verified && <span className={styles.verified}>✓ Verified purchase</span>}
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
      )}
    </article>
  );
}
