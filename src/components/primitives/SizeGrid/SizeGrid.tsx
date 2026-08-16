import { useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './SizeGrid.module.css';

export interface SizeGridItem {
  label: string;
  /**
   * Compact label shown on the tile + in the header (e.g. `XS`), when the full
   * `label` carries extra detail like a measurement range. Falls back to `label`.
   * The full `label` is always kept as the accessible name so screen-reader users
   * still hear the detail even when it's hidden visually (it lives in the guide).
   */
  shortLabel?: string;
  /** Units in stock; drives "Only N left" (≤3) and "Sold out" (0). */
  stock?: number;
  /** Boolean availability fallback when no `stock` count is given. */
  available?: boolean;
}

export interface SizeGridProps {
  items: SizeGridItem[];
  /** Group label (uppercased in the header). @default 'Size' */
  label?: string;
  /** Controlled selected index. */
  value?: number;
  /** Uncontrolled initial selected index. @default first in-stock size */
  defaultValue?: number;
  onChange?: (index: number) => void;
  /** Fixed column count, or `'auto'` for responsive auto-fit. @default 'auto' */
  columns?: number | 'auto';
  /** One-line helper shown under the grid (e.g. measuring tip). */
  helper?: string;
  /** Show the size-guide trigger. @default true */
  showGuide?: boolean;
  /** Size-guide trigger label. @default 'Size guide' */
  guideLabel?: string;
  onGuide?: () => void;
  className?: string;
}

interface DerivedOption {
  /** Full label — used as the accessible name. */
  label: string;
  /** Visible label on the tile/header (short when provided, else the full label). */
  display: string;
  soldOut: boolean;
  low: boolean;
  note: string;
}

function derive(item: SizeGridItem): DerivedOption {
  const hasStock = typeof item.stock === 'number';
  const available = item.available ?? (hasStock ? (item.stock as number) > 0 : true);
  const soldOut = !available || (hasStock && (item.stock as number) <= 0);
  const low = hasStock && (item.stock as number) > 0 && (item.stock as number) <= 3;
  const note = soldOut ? 'Sold out' : low ? `Only ${item.stock} left` : '';
  return { label: item.label, display: item.shortLabel ?? item.label, soldOut, low, note };
}

/**
 * Size selector grid with in-stock / low-stock / sold-out states and an optional
 * size-guide trigger. Sold-out sizes are announced and non-selectable. Controlled
 * (`value`+`onChange`) or uncontrolled (`defaultValue`); accepts either a numeric
 * `stock` count or a boolean `available` per size.
 */
export function SizeGrid({
  items,
  label = 'Size',
  value,
  defaultValue,
  onChange,
  columns = 'auto',
  helper,
  showGuide = true,
  guideLabel = 'Size guide',
  onGuide,
  className,
}: SizeGridProps) {
  const options = items.map(derive);
  const firstInStock = options.findIndex((o) => !o.soldOut);
  const [internal, setInternal] = useState(defaultValue ?? (firstInStock === -1 ? 0 : firstInStock));
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number) => {
    if (options[i]?.soldOut) return;
    if (!isControlled) setInternal(i);
    onChange?.(i);
  };

  const focusIndex = (i: number) => {
    btnRefs.current[i]?.focus();
    select(i);
  };

  const move = (from: number, dir: 1 | -1) => {
    const n = options.length;
    for (let step = 1; step <= n; step++) {
      const next = (from + dir * step + n * step) % n;
      if (!options[next].soldOut) return focusIndex(next);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(i, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(i, -1);
    }
  };

  const selectedLabel = options[selected]?.display ?? options[0]?.display ?? '';
  const gridStyle =
    columns === 'auto'
      ? { gridTemplateColumns: 'repeat(auto-fit, minmax(84px, 1fr))' }
      : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.head}>
        <span className={styles.label}>
          {label.toUpperCase()} — <span className={styles.selected}>{selectedLabel}</span>
        </span>
        {showGuide && onGuide && (
          <button type="button" className={styles.guide} onClick={onGuide}>
            {guideLabel}
          </button>
        )}
      </div>

      <div className={styles.grid} style={gridStyle} role="radiogroup" aria-label={label}>
        {options.map((o, i) => {
          const on = i === selected && !o.soldOut;
          return (
            <button
              key={`${o.label}-${i}`}
              type="button"
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              role="radio"
              aria-checked={on}
              aria-disabled={o.soldOut || undefined}
              aria-label={o.note ? `${o.label} — ${o.note}` : o.label}
              tabIndex={on || (selected < 0 && i === firstInStock) ? 0 : -1}
              className={cx(styles.opt, on && styles.active, o.soldOut && styles.soldOut)}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className={styles.optLabel}>{o.display}</span>
              {o.note && (
                <span className={cx(styles.note, o.soldOut ? styles.noteOut : styles.noteLow)}>
                  {o.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {helper && <div className={styles.helper}>{helper}</div>}
    </div>
  );
}
