import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import type { SummaryRow } from '../../../lib/cart';
import styles from './MobileCheckoutBar.module.css';

export interface MobileCheckoutBarProps {
  /** Pre-formatted grand total. */
  total: string;
  itemCount: number;
  /** Checkout button label. */
  label: string;
  /** Small note above the bar (e.g. free-delivery hint). */
  note?: string;
  /** Note colour intent. @default 'muted' */
  noteTone?: 'good' | 'muted';
  /** Breakdown rows revealed when the bar is expanded. */
  rows?: SummaryRow[];
  loading?: boolean;
  onCheckout?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fixed mobile checkout bar: total + CTA, tapping the total expands an order
 * breakdown behind a scrim. Ports the DC `MobileCheckoutBar`; the toggle is a
 * real button (`aria-expanded`) and Escape collapses it.
 */
export function MobileCheckoutBar({
  total,
  itemCount,
  label,
  note,
  noteTone = 'muted',
  rows,
  loading = false,
  onCheckout,
  className,
  style,
}: MobileCheckoutBarProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !!rows && rows.length > 0;
  const isOpen = expanded && canExpand;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const countLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'} · total`;

  return (
    <div className={cx(styles.root, className)} style={style}>
      {isOpen && <div className={styles.scrim} onClick={() => setExpanded(false)} aria-hidden />}

      <div className={styles.bar}>
        {isOpen && (
          <div className={styles.breakdown} id="mcb-breakdown">
            {rows!.map((r, i) => (
              <div className={styles.row} key={`${r.label}-${i}`}>
                <span className={styles.rowLabel}>{r.label}</span>
                <span className={cx(styles.rowValue, r.tone && styles[`tone_${r.tone}`])}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.foot}>
          {note && (
            <div className={cx(styles.note, noteTone === 'good' && styles.noteOk)}>{note}</div>
          )}
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.totalBtn}
              onClick={() => setExpanded((v) => !v)}
              disabled={!canExpand}
              aria-expanded={canExpand ? isOpen : undefined}
              aria-controls={canExpand ? 'mcb-breakdown' : undefined}
              aria-label="Toggle order breakdown"
            >
              <span className={styles.countLabel}>
                {countLabel}
                {canExpand && (
                  <span className={cx(styles.caret, isOpen && styles.caretOpen)} aria-hidden>
                    ▲
                  </span>
                )}
              </span>
              <span className={styles.total}>{total}</span>
            </button>
            <button
              type="button"
              className={styles.cta}
              onClick={onCheckout}
              disabled={loading}
              aria-busy={loading || undefined}
            >
              {loading && <span className={styles.spinner} aria-hidden />}
              {label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
