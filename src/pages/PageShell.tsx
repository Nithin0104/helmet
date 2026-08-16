import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

export interface PageShellProps {
  /** Small mono kicker above the title (e.g. "SHOP"). */
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

/**
 * Placeholder shell for Phase 3 pages still being built. Each page replaces
 * this with its real layout as it's implemented; kept in one place so the
 * routing scaffolds stay consistent and DRY meanwhile.
 */
export default function PageShell({ eyebrow, title, children }: PageShellProps) {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </div>
  );
}
