import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import styles from './Logo.module.css';

export type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  /** Destination for the wordmark link (default `/`). */
  href?: string;
  size?: LogoSize;
  /** Fired after navigation begins — e.g. to close an open overlay. */
  onClick?: () => void;
  className?: string;
}

/** The rotated accent diamond + APEXLINE wordmark, shared by header and footer. */
export function Logo({ href = '/', size = 'md', onClick, className }: LogoProps) {
  return (
    <Link to={href} className={cx(styles.logo, styles[size], className)} onClick={onClick}>
      <span className={styles.dot} aria-hidden />
      <span className={styles.word}>APEXLINE</span>
    </Link>
  );
}
