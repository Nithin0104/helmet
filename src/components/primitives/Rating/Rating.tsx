import { useState } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Rating.module.css';

export type RatingIcon = 'star' | 'circle' | 'heart';
export type RatingSize = 'small' | 'medium' | 'large';

export interface RatingProps {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  icon?: RatingIcon;
  readOnly?: boolean;
  allowHalf?: boolean;
  size?: RatingSize;
  className?: string;
}

const PATHS: Record<RatingIcon, string> = {
  star: 'M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 15.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85z',
  circle: 'M10 2a8 8 0 100 16 8 8 0 000-16z',
  heart: 'M10 17s-6.5-4.35-8.4-8.05C.4 6.5 1.6 3.5 4.4 3.5c1.7 0 2.9 1.1 3.6 2.2.7-1.1 1.9-2.2 3.6-2.2 2.8 0 4 3 2.8 5.45C16.5 12.65 10 17 10 17z',
};

export function Rating({
  max = 5,
  value,
  defaultValue = 0,
  onChange,
  icon = 'star',
  readOnly = false,
  allowHalf = false,
  size = 'medium',
  className,
}: RatingProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const shown = hover ?? current;

  const interactive = !readOnly;

  const set = (v: number) => {
    if (!interactive) return;
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const valueForEvent = (index: number, e: React.MouseEvent) => {
    if (!allowHalf) return index + 1;
    const { left, width } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return e.clientX - left < width / 2 ? index + 0.5 : index + 1;
  };

  return (
    <div
      className={cx(styles.rating, styles[size], interactive && styles.interactive, className)}
      role={interactive ? 'slider' : 'img'}
      aria-label={`${current} out of ${max}`}
      aria-valuenow={interactive ? current : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? max : undefined}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const fillPct = Math.max(0, Math.min(1, shown - i)) * 100;
        return (
          <span
            key={i}
            className={styles.iconWrap}
            onMouseMove={interactive && allowHalf ? (e) => setHover(valueForEvent(i, e)) : undefined}
            onMouseEnter={interactive && !allowHalf ? () => setHover(i + 1) : undefined}
            onClick={interactive ? (e) => set(valueForEvent(i, e)) : undefined}
          >
            <svg viewBox="0 0 20 20" className={styles.icon} style={{ '--fill': `${fillPct}%` } as CSSProperties}>
              <defs>
                <linearGradient id={`rg-${i}-${fillPct}`}>
                  <stop offset={`${fillPct}%`} stopColor="var(--gold)" />
                  <stop offset={`${fillPct}%`} stopColor="var(--surface-raised)" />
                </linearGradient>
              </defs>
              <path d={PATHS[icon]} fill={`url(#rg-${i}-${fillPct})`} stroke="var(--gold)" strokeWidth="0.7" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
