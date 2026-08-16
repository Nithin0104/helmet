import { Check } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../../primitives';
import styles from './CartToast.module.css';

export interface CartToastProps {
  /** Whether the toast is shown. */
  visible: boolean;
  message?: string;
  className?: string;
}

/**
 * The centered "added to cart" confirmation. Standalone (rather than the Phase 1
 * `Toast`) to match the DC's full accent-border treatment and checkmark.
 * Purely presentational — the parent owns the show/hide timer.
 */
export function CartToast({ visible, message = 'Added to cart', className }: CartToastProps) {
  if (!visible) return null;

  return (
    <div className={cx(styles.toast, className)} role="status" aria-live="polite">
      <Icon icon={Check} size="sm" className={styles.icon} />
      {message}
    </div>
  );
}
