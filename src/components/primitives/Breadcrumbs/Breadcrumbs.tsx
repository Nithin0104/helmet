import type { CSSProperties } from 'react';
import { ChevronRight, Dot } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
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
  /**
   * Intercept a crumb click for client-side (SPA) navigation. Called on a plain
   * left-click with the crumb's `href`; the real `<a href>` is preserved so
   * middle-click / open-in-new-tab and SEO still work.
   */
  onNavigate?: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

/** A plain left-click (no modifier keys, primary button) we can safely intercept. */
function isPlainClick(e: React.MouseEvent): boolean {
  return !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0;
}

export function Breadcrumbs({
  items,
  separator = 'chevron',
  speed = 0.18,
  onNavigate,
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
                <a
                  href={item.href}
                  className={styles.link}
                  onClick={(e) => {
                    if (onNavigate && isPlainClick(e)) {
                      e.preventDefault();
                      onNavigate(item.href!, e);
                    }
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span className={cx(styles.link, isLast && styles.current)} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.sep} aria-hidden>
                  {separator === 'slash' ? '/' : <Icon icon={separator === 'dot' ? Dot : ChevronRight} size="sm" />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
