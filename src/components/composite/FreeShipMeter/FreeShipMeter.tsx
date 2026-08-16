import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import { formatPrice } from '../../../lib/format';
import styles from './FreeShipMeter.module.css';

export interface FreeShipMeterProps {
  /** Current cart subtotal in rupees. */
  subtotal: number;
  /** Spend at/above which delivery becomes free. */
  threshold: number;
  /** Copy shown once the threshold is met. */
  unlockedLabel?: string;
  /** Money formatter — defaults to INR `formatPrice`. */
  formatValue?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Free-delivery progress meter: a message + goal label over a progress bar that
 * fills toward the threshold and flips to the success colour once unlocked.
 * Ports the DC `FreeShipMeter`; accent comes from the global theme.
 */
export function FreeShipMeter({
  subtotal,
  threshold,
  unlockedLabel = 'Free delivery unlocked',
  formatValue = formatPrice,
  className,
  style,
}: FreeShipMeterProps) {
  const unlocked = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 100;

  return (
    <div className={cx(styles.root, className)} style={style}>
      <div className={styles.head}>
        <span className={cx(styles.msg, unlocked && styles.msgOk)}>
          {unlocked ? unlockedLabel : `Add ${formatValue(remaining)} for free delivery`}
        </span>
        <span className={styles.goal}>{formatValue(threshold)} goal</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(subtotal, threshold)}
        aria-label="Progress toward free delivery"
      >
        <div
          className={cx(styles.bar, unlocked && styles.barOk)}
          style={{ '--pct': `${pct}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
