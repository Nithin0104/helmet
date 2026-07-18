import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../lib/cx';
import styles from './BottomSheet.module.css';

export interface BottomSheetProps {
  title?: ReactNode;
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
  snapPoints?: number[];
  showHandle?: boolean;
  className?: string;
}

export function BottomSheet({
  title,
  open,
  onClose,
  children,
  snapPoints = [90],
  showHandle = true,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const maxHeight = `${Math.max(...snapPoints)}vh`;

  return createPortal(
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={cx(styles.sheet, className)}
        role="dialog"
        aria-modal="true"
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {showHandle && <div className={styles.handle} aria-hidden />}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
