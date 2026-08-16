import { useState } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';
import styles from './ActionButton.module.css';

export type ActionButtonVariant = 'add-to-cart' | 'submit';
export type ActionButtonState = 'idle' | 'loading' | 'done';

export interface ActionButtonProps {
  variant?: ActionButtonVariant;
  label?: string;
  loadingLabel?: string;
  doneLabel?: string;
  state?: ActionButtonState;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  fullWidth?: boolean;
  doneDuration?: number;
  className?: string;
}

const DEFAULT_LABELS: Record<ActionButtonVariant, { idle: string; loading: string; done: string }> = {
  'add-to-cart': { idle: 'Add to cart', loading: 'Adding…', done: 'Added' },
  submit: { idle: 'Submit', loading: 'Submitting…', done: 'Done' },
};

export function ActionButton({
  variant = 'add-to-cart',
  label,
  loadingLabel,
  doneLabel,
  state,
  onClick,
  disabled = false,
  fullWidth = false,
  doneDuration = 1600,
  className,
}: ActionButtonProps) {
  const [internal, setInternal] = useState<ActionButtonState>('idle');
  const isControlled = state !== undefined;
  const current = isControlled ? state : internal;

  const defaults = DEFAULT_LABELS[variant];
  const text =
    current === 'loading'
      ? (loadingLabel ?? defaults.loading)
      : current === 'done'
        ? (doneLabel ?? defaults.done)
        : (label ?? defaults.idle);

  const handleClick = async () => {
    if (disabled || current === 'loading') return;
    if (!isControlled) setInternal('loading');
    try {
      await onClick?.();
    } finally {
      if (!isControlled) {
        setInternal('done');
        setTimeout(() => setInternal('idle'), doneDuration);
      }
    }
  };

  return (
    <button
      type="button"
      className={cx(
        styles.btn,
        styles[variant],
        styles[current],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || current === 'loading'}
      aria-live="polite"
      onClick={handleClick}
    >
      {current === 'loading' && <Spinner size={16} color="#fff" thickness={2} className={styles.spinner} />}
      {current === 'done' && (
        <Icon icon={Check} size="sm" strokeWidth={2.4} className={styles.check} />
      )}
      <span className={styles.label}>{text}</span>
    </button>
  );
}
