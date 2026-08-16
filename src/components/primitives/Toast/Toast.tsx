import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './Toast.module.css';

export type ToastTone = 'default' | 'success' | 'error' | 'info';
export type ToastPosition = 'bottom' | 'top';

export interface ToastProps {
  message: ReactNode;
  open?: boolean;
  tone?: ToastTone;
  position?: ToastPosition;
  duration?: number;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  className?: string;
}

export function Toast({
  message,
  open = true,
  tone = 'default',
  position = 'bottom',
  duration = 3000,
  onDismiss,
  action,
  icon,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open || !duration || duration <= 0) return;
    const t = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onDismiss]);

  if (!open) return null;

  return (
    <div
      className={cx(styles.toast, styles[tone], styles[position], className)}
      role="status"
      aria-live="polite"
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.message}>{message}</span>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button type="button" className={styles.close} aria-label="Dismiss" onClick={onDismiss}>
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
}
