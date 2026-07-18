import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './ColorSwatch.module.css';

export type ColorSwatchSize = 'small' | 'medium' | 'large';

export interface SwatchOption {
  value: string;
  hex: string;
  name?: string;
  disabled?: boolean;
}

export interface ColorSwatchProps {
  colors: SwatchOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: ColorSwatchSize;
  label?: string;
  className?: string;
}

export function ColorSwatch({
  colors,
  value,
  defaultValue,
  onChange,
  size = 'medium',
  label,
  className,
}: ColorSwatchProps) {
  const [internal, setInternal] = useState(defaultValue ?? colors[0]?.value);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const pick = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <div className={cx(styles.wrap, className)}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row} role="radiogroup" aria-label={label}>
        {colors.map((c) => (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={selected === c.value}
            aria-label={c.name ?? c.value}
            title={c.name ?? c.value}
            disabled={c.disabled}
            onClick={() => pick(c.value)}
            className={cx(styles.swatch, styles[size], selected === c.value && styles.active)}
            style={{ '--swatch': c.hex } as React.CSSProperties}
          >
            <span className={styles.fill} />
          </button>
        ))}
      </div>
    </div>
  );
}
