import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
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
      <Icon icon={Search} size="sm" className={styles.searchIcon} />
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
          <Icon icon={X} size="sm" />
        </button>
      )}
    </form>
  );
}
