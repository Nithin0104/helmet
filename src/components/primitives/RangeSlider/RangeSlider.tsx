import { useRef, useState, useCallback } from 'react';
import { cx } from '../../../lib/cx';
import styles from './RangeSlider.module.css';

type SingleValue = number;
type DualValue = [number, number];

export interface RangeSliderProps<V extends SingleValue | DualValue = SingleValue> {
  min?: number;
  max?: number;
  step?: number;
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function RangeSlider<V extends SingleValue | DualValue = SingleValue>({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  prefix = '',
  suffix = '',
  disabled = false,
  showValue = true,
  className,
}: RangeSliderProps<V>) {
  const dual = Array.isArray(value ?? defaultValue);
  const initial = (defaultValue ?? (dual ? [min, max] : min)) as V;
  const [internal, setInternal] = useState<V>(initial);
  const isControlled = value !== undefined;
  const current = (isControlled ? value : internal) as V;
  const trackRef = useRef<HTMLDivElement>(null);

  const commit = useCallback(
    (next: V) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const snap = (raw: number) => {
    const snapped = Math.round((raw - min) / step) * step + min;
    return clamp(Number(snapped.toFixed(6)), min, max);
  };

  const valueFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snap(min + ratio * (max - min));
  };

  const startDrag = (thumb: 0 | 1) => (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const v = valueFromClientX(ev.clientX);
      if (Array.isArray(current)) {
        const [lo, hi] = current;
        const next: DualValue = thumb === 0 ? [Math.min(v, hi), hi] : [lo, Math.max(v, lo)];
        commit(next as V);
      } else {
        commit(v as V);
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const fmt = (v: number) => `${prefix}${v.toLocaleString('en-IN')}${suffix}`;

  const isDual = Array.isArray(current);
  const lo = isDual ? (current as DualValue)[0] : min;
  const hi = isDual ? (current as DualValue)[1] : (current as number);

  return (
    <div className={cx(styles.wrap, disabled && styles.disabled, className)}>
      {showValue && (
        <div className={styles.readout}>
          {Array.isArray(current) ? (
            <>
              <span>{fmt(current[0])}</span>
              <span>{fmt(current[1])}</span>
            </>
          ) : (
            <span>{fmt(current)}</span>
          )}
        </div>
      )}
      <div className={styles.track} ref={trackRef}>
        <div
          className={styles.fill}
          style={{ left: `${Array.isArray(current) ? pct(lo) : 0}%`, right: `${100 - pct(hi)}%` }}
        />
        {Array.isArray(current) && (
          <button
            type="button"
            className={styles.thumb}
            style={{ left: `${pct(lo)}%` }}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={lo}
            disabled={disabled}
            onPointerDown={startDrag(0)}
          />
        )}
        <button
          type="button"
          className={styles.thumb}
          style={{ left: `${pct(hi)}%` }}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={hi}
          disabled={disabled}
          onPointerDown={startDrag(Array.isArray(current) ? 1 : 0)}
        />
      </div>
    </div>
  );
}
