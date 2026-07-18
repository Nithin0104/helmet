import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './QtyStepper.module.css';

export type QtyStepperVariant = 'rounded' | 'pill';
export type QtyStepperSize = 'sm' | 'md' | 'lg';

export interface QtyStepperProps {
  variant?: QtyStepperVariant;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: QtyStepperSize;
  disabled?: boolean;
  className?: string;
}

export function QtyStepper({
  variant = 'rounded',
  value,
  defaultValue = 1,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  disabled = false,
  className,
}: QtyStepperProps) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const set = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    if (!isControlled) setInternal(clamped);
    onChange?.(clamped);
  };

  return (
    <div
      className={cx(styles.stepper, styles[variant], styles[size], disabled && styles.disabled, className)}
    >
      <button
        type="button"
        className={styles.btn}
        disabled={disabled || current <= min}
        aria-label="Decrease quantity"
        onClick={() => set(current - 1)}
      >
        −
      </button>
      <span className={styles.value} aria-live="polite">
        {current}
      </span>
      <button
        type="button"
        className={styles.btn}
        disabled={disabled || current >= max}
        aria-label="Increase quantity"
        onClick={() => set(current + 1)}
      >
        +
      </button>
    </div>
  );
}
