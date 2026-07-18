import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Spinner.module.css';

export type SpinnerSize = 'small' | 'medium' | 'large' | number;

export interface SpinnerProps {
  size?: SpinnerSize;
  thickness?: number;
  color?: string;
  label?: string;
  className?: string;
}

const SIZE_MAP: Record<string, number> = { small: 16, medium: 24, large: 40 };

export function Spinner({
  size = 'medium',
  thickness = 2.5,
  color = 'var(--accent)',
  label = 'Loading',
  className,
}: SpinnerProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];

  return (
    <span
      className={cx(styles.spinner, className)}
      role="status"
      aria-label={label}
      style={
        {
          '--size': `${px}px`,
          '--thickness': `${thickness}px`,
          '--color': color,
        } as CSSProperties
      }
    >
      <span className={styles.visuallyHidden}>{label}</span>
    </span>
  );
}
