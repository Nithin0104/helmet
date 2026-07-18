import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export function SearchBar({
  value,
  defaultValue = '',
  onChange,
  onSubmit,
  onClear,
  loading = false,
  placeholder = 'Search…',
  disabled = false,
  className,
  name,
}: SearchBarProps) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const clear = () => {
    setValue('');
    onClear?.();
  };

  return (
    <form
      className={cx(styles.bar, disabled && styles.disabled, className)}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(current);
      }}
    >
      <svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden>
        <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M14 14L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        className={styles.input}
        type="search"
        name={name}
        value={current}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />
      {loading && <span className={styles.spinner} aria-hidden />}
      {!loading && current && (
        <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
          ×
        </button>
      )}
    </form>
  );
}
