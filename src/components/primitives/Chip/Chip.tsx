import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Chip.module.css';

export type ChipVariant = 'select' | 'filter' | 'nav';

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  variant?: ChipVariant;
  label?: string;
  children?: ReactNode;
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
  removable?: boolean;
  onRemove?: () => void;
  count?: number;
  icon?: ReactNode;
}

export function Chip({
  variant = 'select',
  label,
  children,
  selected = false,
  onToggle,
  removable = false,
  onRemove,
  count,
  icon,
  disabled,
  className,
  onClick,
  ...rest
}: ChipProps) {
  const content = children ?? label;

  return (
    <button
      type="button"
      className={cx(styles.chip, styles[variant], selected && styles.selected, className)}
      aria-pressed={variant !== 'nav' ? selected : undefined}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onToggle?.(!selected);
      }}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {content != null && <span className={styles.label}>{content}</span>}
      {count != null && <span className={styles.count}>{count}</span>}
      {removable && (
        <span
          className={styles.remove}
          role="button"
          aria-label="Remove"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          ×
        </span>
      )}
    </button>
  );
}
