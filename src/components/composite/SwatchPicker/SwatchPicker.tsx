import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './SwatchPicker.module.css';

export type SwatchPickerSize = 'small' | 'medium' | 'large';

export interface SwatchPickerItem {
  name: string;
  hex: string;
  disabled?: boolean;
}

export interface SwatchPickerProps {
  items: SwatchPickerItem[];
  /** Group label (uppercased); paired with the selected swatch name. @default 'Colour' */
  label?: string;
  /** Controlled selected index. */
  value?: number;
  /** Uncontrolled initial selected index. @default 0 */
  defaultValue?: number;
  onChange?: (index: number) => void;
  size?: SwatchPickerSize;
  className?: string;
}

const DIAMETER: Record<SwatchPickerSize, number> = { small: 26, medium: 34, large: 44 };

/**
 * Labelled colour-swatch selector for the PDP ("COLOUR — Matte Black"). A ring
 * highlights the active swatch. Controlled (`value`+`onChange`) or uncontrolled.
 * Shares the `ColorSwatch` primitive's radiogroup a11y pattern with an index-based
 * API to match the PDP's variant state.
 */
export function SwatchPicker({
  items,
  label = 'Colour',
  value,
  defaultValue = 0,
  onChange,
  size = 'medium',
  className,
}: SwatchPickerProps) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const pick = (i: number) => {
    if (items[i]?.disabled) return;
    if (!isControlled) setInternal(i);
    onChange?.(i);
  };

  const selectedName = items[selected]?.name ?? items[0]?.name ?? '';
  const d = DIAMETER[size];

  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.head}>
        <span className={styles.label}>
          {label.toUpperCase()} — <span className={styles.selected}>{selectedName}</span>
        </span>
      </div>
      <div className={styles.row} role="radiogroup" aria-label={label}>
        {items.map((c, i) => (
          <button
            key={`${c.name}-${i}`}
            type="button"
            role="radio"
            aria-checked={i === selected}
            aria-label={c.name}
            title={c.name}
            disabled={c.disabled}
            className={cx(styles.swatch, i === selected && styles.active)}
            style={{ '--swatch': c.hex, '--d': `${d}px` } as React.CSSProperties}
            onClick={() => pick(i)}
          >
            <span className={styles.fill} />
          </button>
        ))}
      </div>
    </div>
  );
}
