import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { useId } from 'react';
import { cx } from '../../../lib/cx';
import styles from './TextInput.module.css';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function TextInput({
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  id,
  className,
  required,
  disabled,
  ref,
  ...rest
}: TextInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cx(styles.wrap, disabled && styles.disabled, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.req}>*</span>}
        </label>
      )}
      <div className={cx(styles.field, error && styles.hasError)}>
        {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
        <input
          id={inputId}
          ref={ref}
          className={styles.input}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {iconRight && <span className={styles.icon}>{iconRight}</span>}
      </div>
      {error ? (
        <span id={`${inputId}-err`} className={styles.error}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
