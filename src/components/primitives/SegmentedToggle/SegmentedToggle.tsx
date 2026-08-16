import { useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './SegmentedToggle.module.css';

export type SegmentedVariant = 'grid-density' | 'view-mode' | 'text' | 'compact';
export type SegmentedShape = 'square' | 'rounded' | 'pill';

export interface SegmentItem {
  label: string;
  /** Stable value; defaults to `label`. */
  value?: string;
  /** Dot-grid glyph dimensions — when `cols*rows > 0` the segment shows a dot grid. */
  cols?: number;
  rows?: number;
}

export interface SegmentedToggleProps {
  /** Items as plain strings or `{ label, value?, cols?, rows? }`. Falls back to `variant` preset. */
  items?: Array<string | SegmentItem>;
  variant?: SegmentedVariant;
  shape?: SegmentedShape;
  /** Segment height in px. Default 38. */
  size?: number;
  /** Controlled selected value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, index: number) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

const PRESETS: Record<SegmentedVariant, SegmentItem[]> = {
  'grid-density': [
    { label: '2 columns', cols: 2, rows: 2 },
    { label: '3 columns', cols: 3, rows: 2 },
    { label: '4 columns', cols: 4, rows: 2 },
  ],
  'view-mode': [
    { label: 'Grid', cols: 2, rows: 2 },
    { label: 'List', cols: 1, rows: 3 },
  ],
  text: [{ label: 'All' }, { label: 'New in' }, { label: 'Sale' }],
  compact: [
    { label: 'Comfy', cols: 2, rows: 2 },
    { label: 'Compact', cols: 3, rows: 3 },
  ],
};

function normalize(items: Array<string | SegmentItem>): SegmentItem[] {
  return items.map((it) => (typeof it === 'string' ? { label: it } : it));
}

export function SegmentedToggle({
  items,
  variant = 'grid-density',
  shape = 'square',
  size = 38,
  value,
  defaultValue,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: SegmentedToggleProps) {
  const autoId = useId();
  const segs = normalize(items && items.length ? items : PRESETS[variant]);
  const valueOf = (s: SegmentItem) => s.value ?? s.label;

  const [internal, setInternal] = useState(defaultValue ?? valueOf(segs[0]));
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;
  const activeIndex = Math.max(
    0,
    segs.findIndex((s) => valueOf(s) === selected),
  );

  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const pick = (idx: number) => {
    const s = segs[idx];
    if (!s || disabled) return;
    const v = valueOf(s);
    if (!isControlled) setInternal(v);
    onChange?.(v, idx);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let next = activeIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (activeIndex + 1) % segs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (activeIndex - 1 + segs.length) % segs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = segs.length - 1;
    else return;
    e.preventDefault();
    pick(next);
    btnRefs.current[next]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? 'View options'}
      className={cx(styles.group, styles[`shape_${shape}`], className)}
      style={{ '--seg-size': `${size}px` } as CSSProperties}
      onKeyDown={onKeyDown}
    >
      {segs.map((s, i) => {
        const n = (s.cols ?? 0) * (s.rows ?? 0);
        const isDots = n > 0;
        const on = i === activeIndex;
        return (
          <button
            key={`${autoId}-${valueOf(s)}`}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            aria-label={s.label}
            title={s.label}
            aria-pressed={on}
            disabled={disabled}
            tabIndex={on ? 0 : -1}
            className={cx(styles.seg, isDots ? styles.hasDots : styles.hasText, on && styles.active)}
            onClick={() => pick(i)}
          >
            {isDots ? (
              <span
                aria-hidden
                className={styles.dots}
                style={
                  {
                    gridTemplateColumns: `repeat(${s.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${s.rows}, 1fr)`,
                    width: `${(s.cols ?? 0) * 5 + ((s.cols ?? 0) - 1) * 2}px`,
                    height: `${(s.rows ?? 0) * 5 + ((s.rows ?? 0) - 1) * 2}px`,
                  } as CSSProperties
                }
              >
                {Array.from({ length: n }, (_, d) => (
                  <i key={d} className={styles.dot} />
                ))}
              </span>
            ) : (
              <span>{s.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
