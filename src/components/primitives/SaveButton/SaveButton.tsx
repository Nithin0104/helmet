import type { MouseEvent } from 'react';
import { cx } from '../../../lib/cx';
import styles from './SaveButton.module.css';

export type SaveButtonSize = 'sm' | 'md';

export interface SaveButtonProps {
  /** Whether the item is currently saved (controlled). */
  saved: boolean;
  /** Called with the next saved state when the button is toggled. */
  onToggle: (next: boolean) => void;
  /**
   * Subject for the accessible label, usually the product name — the label
   * reads "Save {label}" / "Remove {label} from your wishlist".
   */
  label: string;
  /** Visual size. Default `md` (28px). */
  size?: SaveButtonSize;
  disabled?: boolean;
  className?: string;
}

/**
 * A wishlist save toggle: an outline heart that fills (accent) when saved, with
 * a small pop on save. It's a real toggle button (`aria-pressed`) with a dynamic
 * label and a visible focus ring. Click is contained (stop/prevent) so it never
 * triggers a surrounding card link or drag.
 */
export function SaveButton({
  saved,
  onToggle,
  label,
  size = 'md',
  disabled = false,
  className,
}: SaveButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onToggle(!saved);
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from your wishlist` : `Save ${label}`}
      disabled={disabled}
      onClick={handleClick}
      className={cx(styles.btn, styles[size], saved && styles.saved, className)}
    >
      <span aria-hidden className={styles.icon}>
        {saved ? '♥' : '♡'}
      </span>
    </button>
  );
}
