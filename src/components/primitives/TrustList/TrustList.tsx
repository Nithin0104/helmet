import type { ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './TrustList.module.css';

export interface TrustListItem {
  /** Decorative icon (a lucide `<Icon>` node or a glyph); rendered aria-hidden. */
  icon?: ReactNode;
  title: string;
  sub: string;
}

export interface TrustListProps {
  items: TrustListItem[];
  /** Vertical list (`stack`) or a 3-up row on wider viewports (`row`). @default 'stack' */
  layout?: 'stack' | 'row';
  className?: string;
}

/** Trust/reassurance badges (delivery, returns, warranty…) — a stacked or row list. */
export function TrustList({ items, layout = 'stack', className }: TrustListProps) {
  return (
    <ul className={cx(styles.list, layout === 'row' && styles.row, className)}>
      {items.map((it, i) => (
        <li key={`${it.title}-${i}`} className={styles.item}>
          {it.icon != null && (
            <span className={styles.icon} aria-hidden>
              {it.icon}
            </span>
          )}
          <div className={styles.text}>
            <div className={styles.title}>{it.title}</div>
            <div className={styles.sub}>{it.sub}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
