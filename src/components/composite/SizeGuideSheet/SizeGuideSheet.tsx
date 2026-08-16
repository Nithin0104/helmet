import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../lib/cx';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import styles from './SizeGuideSheet.module.css';

export interface SizeGuideSheetProps {
  open: boolean;
  onClose?: () => void;
  /** @default 'Size guide' */
  title?: string;
  /** Small kicker under the title. */
  note?: string;
  /** Closing tip line under the table. */
  tip?: string;
  /** Column headers. @default ['SIZE', 'HEAD (CM)', 'HAT'] */
  columns?: string[];
  rows: string[][];
  /** First-cell value of the row to highlight (the shopper's selected size). */
  highlight?: string;
  className?: string;
}

const DEFAULT_COLUMNS = ['SIZE', 'HEAD (CM)', 'HAT'];

/**
 * Size-chart overlay: a bottom-sheet on mobile and a centered dialog on desktop.
 * Focus-trapped, Escape/scrim close, and the shopper's selected size row is
 * highlighted. Rendered in a portal so it escapes the buy-panel stacking context.
 */
export function SizeGuideSheet({
  open,
  onClose,
  title = 'Size guide',
  note = 'MEASURE 1CM ABOVE THE EYEBROWS',
  tip = 'Between two sizes? Choose the smaller shell — the comfort liner beds in after roughly 20 hours of wear.',
  columns = DEFAULT_COLUMNS,
  rows,
  highlight,
  className,
}: SizeGuideSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, { onEscape: onClose });

  if (!open) return null;

  return createPortal(
    <div className={styles.shell}>
      <div className={styles.scrim} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        className={cx(styles.panel, className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={styles.head}>
          <div>
            <div className={styles.title}>{title}</div>
            {note && <div className={styles.note}>{note}</div>}
          </div>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.grid}>
          {columns.map((h, ci) => (
            <div key={`h-${ci}`} className={styles.headCell}>
              {h}
            </div>
          ))}
          {rows.map((row) => {
            const on = highlight != null && String(highlight) === String(row[0]);
            return row.map((cell, ci) => (
              <div
                key={`${row[0]}-${ci}`}
                className={cx(
                  styles.cell,
                  ci === 0 && styles.cellLead,
                  on && styles.cellOn,
                  on && ci === 0 && styles.cellOnLead,
                )}
              >
                {cell}
              </div>
            ));
          })}
        </div>

        {tip && <div className={styles.tip}>{tip}</div>}
      </div>
    </div>,
    document.body,
  );
}
