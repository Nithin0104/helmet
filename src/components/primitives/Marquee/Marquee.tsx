import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Marquee.module.css';

export type MarqueeVariant = 'dark' | 'solid';
export type MarqueeDirection = 'left' | 'right';

export interface MarqueeProps {
  items?: ReactNode[];
  children?: ReactNode;
  variant?: MarqueeVariant;
  direction?: MarqueeDirection;
  speed?: number;
  gap?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  items,
  children,
  variant = 'dark',
  direction = 'left',
  speed = 20,
  gap = 48,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const content = items ? (
    items.map((item, i) => (
      <span key={i} className={styles.item}>
        {item}
      </span>
    ))
  ) : (
    <span className={styles.item}>{children}</span>
  );

  return (
    <div
      className={cx(styles.marquee, styles[variant], pauseOnHover && styles.pauseHover, className)}
      style={
        {
          '--speed': `${speed}s`,
          '--gap': `${gap}px`,
          '--dir': direction === 'right' ? 'reverse' : 'normal',
        } as CSSProperties
      }
    >
      <div className={styles.track} aria-hidden={false}>
        {content}
      </div>
      <div className={styles.track} aria-hidden>
        {content}
      </div>
    </div>
  );
}
