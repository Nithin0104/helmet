import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Toggle.module.css';

export type ToggleSize = 'small' | 'medium' | 'large';

export interface ToggleProps {
  size?: ToggleSize;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  name?: string;
  id?: string;
  className?: string;
}

export function Toggle({
  size = 'medium',
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  name,
  id,
  className,
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange?.(!on);
  };

  return (
    <label className={cx(styles.wrap, disabled && styles.disabled, className)}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        id={id}
        disabled={disabled}
        onClick={toggle}
        className={cx(styles.track, styles[size], on && styles.on)}
      >
        <span className={styles.thumb} />
      </button>
      {name && <input type="checkbox" name={name} checked={on} readOnly hidden />}
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
