import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Breadcrumbs.module.css';

export type BreadcrumbSeparator = 'chevron' | 'slash' | 'dot';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  speed?: number;
  className?: string;
}

const SEPARATORS: Record<BreadcrumbSeparator, string> = {
  chevron: '›',
  slash: '/',
  dot: '•',
};

export function Breadcrumbs({
  items,
  separator = 'chevron',
  speed = 0.18,
  className,
}: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx(styles.nav, className)} style={{ '--speed': `${speed}s` } as CSSProperties}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={styles.item}>
              {item.href && !isLast ? (
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              ) : (
                <span className={cx(styles.link, isLast && styles.current)} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.sep} aria-hidden>
                  {SEPARATORS[separator]}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
