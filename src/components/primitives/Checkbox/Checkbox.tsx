import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'small' | 'medium' | 'large';
export type CheckboxShape = 'rounded' | 'circle';

export interface CheckboxProps {
  size?: CheckboxSize;
  shape?: CheckboxShape;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  name?: string;
  id?: string;
  className?: string;
}

export function Checkbox({
  size = 'medium',
  shape = 'rounded',
  checked,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  name,
  id,
  className,
}: CheckboxProps) {
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
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : on}
        id={id}
        disabled={disabled}
        onClick={toggle}
        className={cx(
          styles.box,
          styles[size],
          styles[shape],
          (on || indeterminate) && styles.checked,
        )}
      >
        {indeterminate ? (
          <span className={styles.dash} />
        ) : (
          on && (
            <svg className={styles.tick} viewBox="0 0 16 16" aria-hidden>
              <path d="M3 8.5L6.5 12L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        )}
      </button>
      {name && <input type="checkbox" name={name} checked={on} readOnly hidden />}
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
