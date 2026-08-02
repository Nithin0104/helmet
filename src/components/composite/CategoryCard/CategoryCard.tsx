import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import styles from './CategoryCard.module.css';

export interface CategoryCardProps {
  /** Small mono kicker (e.g. "CAT 01"). */
  kicker: string;
  title: string;
  caption: string;
  href: string;
  className?: string;
}

/** A single category tile linking into the catalog. */
export function CategoryCard({ kicker, title, caption, href, className }: CategoryCardProps) {
  return (
    <Link to={href} className={cx(styles.card, className)} aria-label={title}>
      <span className={styles.kicker}>{kicker}</span>
      <span className={styles.arrow} aria-hidden>
        →
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        <span className={styles.caption}>{caption}</span>
      </span>
    </Link>
  );
}
