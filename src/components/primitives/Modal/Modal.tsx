import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './Modal.module.css';

export type ModalVariant = 'center' | 'sheet';
export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  variant?: ModalVariant;
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnScrim?: boolean;
  showClose?: boolean;
  className?: string;
}

export function Modal({
  variant = 'center',
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnScrim = true,
  showClose = true,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={cx(styles.scrim, styles[variant])} onClick={closeOnScrim ? onClose : undefined}>
      <div
        className={cx(styles.modal, styles[size], className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {showClose && (
              <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
                <Icon icon={X} size="sm" />
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
