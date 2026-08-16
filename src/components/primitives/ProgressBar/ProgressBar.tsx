import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './ProgressBar.module.css';

export type ProgressTone = 'accent' | 'success' | 'danger' | 'gold';

export interface ProgressBarProps {
  value?: number;
  indeterminate?: boolean;
  height?: number;
  tone?: ProgressTone;
  showLabel?: boolean;
  speed?: number;
  /** Accessible name for the progressbar role. Default: 'Progress'. */
  label?: string;
  className?: string;
}

export function ProgressBar({
  value = 0,
  indeterminate = false,
  height = 8,
  tone = 'accent',
  showLabel = false,
  speed = 1.4,
  label = 'Progress',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cx(styles.wrap, className)}>
      <div
        className={cx(styles.track, styles[tone])}
        style={{ height, '--speed': `${speed}s` } as CSSProperties}
        role="progressbar"
        aria-label={label}
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cx(styles.fill, indeterminate && styles.indeterminate)}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
      {showLabel && !indeterminate && <span className={styles.label}>{Math.round(pct)}%</span>}
    </div>
  );
}
