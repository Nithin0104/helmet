import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './UndoToast.module.css';

export interface UndoToastProps {
  /** When false the toast renders nothing. */
  open: boolean;
  /** Status message, e.g. "Removed Velocity RS Carbon". */
  message: string;
  /** Action button label. @default 'UNDO' */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Undo snackbar: a polite `status` bar with a message and a single action.
 * Presentational — the parent owns the open/close timer and positioning.
 * Ports the DC `UndoToast`.
 */
export function UndoToast({
  open,
  message,
  actionLabel = 'UNDO',
  onAction,
  className,
  style,
}: UndoToastProps) {
  if (!open) return null;
  return (
    <div className={cx(styles.toast, className)} role="status" style={style}>
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.action} onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}
