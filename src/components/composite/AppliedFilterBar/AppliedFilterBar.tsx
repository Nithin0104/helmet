import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../../primitives';
import styles from './AppliedFilterBar.module.css';

export type AppliedFilterVariant = 'inline' | 'stacked' | 'boxed';
export type AppliedFilterChipStyle = 'outline' | 'solid' | 'soft' | 'pill';

export interface AppliedFilterChip {
  /** Stable key; defaults to `group|label`. */
  value?: string;
  /** Facet group (e.g. "Brand") — shown as a prefix when `showGroups`. */
  group?: string;
  label: string;
}

export interface AppliedFilterBarProps {
  /** Chips as `{ group?, label, value? }` or plain strings. */
  chips: Array<AppliedFilterChip | string>;
  variant?: AppliedFilterVariant;
  chipStyle?: AppliedFilterChipStyle;
  showCount?: boolean;
  showGroups?: boolean;
  countLabel?: string;
  clearLabel?: string;
  emptyLabel?: string;
  /** Called with the removed chip. When omitted, the bar still hides it itself. */
  onRemove?: (chip: AppliedFilterChip) => void;
  onClearAll?: () => void;
  className?: string;
}

function keyOf(c: AppliedFilterChip): string {
  return c.value ?? `${c.group ?? ''}|${c.label}`;
}

function normalize(chips: Array<AppliedFilterChip | string>): AppliedFilterChip[] {
  return chips.map((c) => (typeof c === 'string' ? { label: c } : c));
}

/**
 * The applied-filters chip bar for a PLP: a result count, removable filter chips,
 * and a clear-all. Removal notifies the parent via `onRemove`/`onClearAll` and also
 * self-hides the chip so it works with or without controlled parent filter state.
 */
export function AppliedFilterBar({
  chips,
  variant = 'inline',
  chipStyle = 'outline',
  showCount = true,
  showGroups = false,
  countLabel = 'Showing 1–9 of 24 helmets',
  clearLabel = 'Clear all',
  emptyLabel = 'No filters applied',
  onRemove,
  onClearAll,
  className,
}: AppliedFilterBarProps) {
  const all = normalize(chips);
  const [removed, setRemoved] = useState<string[]>([]);
  // Reconcile self-hidden keys with the incoming chips: when a controlled parent
  // drops a chip (its own state), prune it from `removed` so re-applying that filter
  // shows the chip again. Uncontrolled callers pass a stable `chips` array, so this
  // is a no-op for them and the self-hide sticks.
  useEffect(() => {
    setRemoved((r) => {
      const present = new Set(all.map(keyOf));
      const next = r.filter((k) => present.has(k));
      return next.length === r.length ? r : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips]);
  const live = all.filter((c) => !removed.includes(keyOf(c)));

  const remove = (c: AppliedFilterChip) => {
    setRemoved((r) => [...r, keyOf(c)]);
    onRemove?.(c);
  };
  const clearAll = () => {
    setRemoved(all.map(keyOf));
    onClearAll?.();
  };

  const showDivider = showCount && variant !== 'stacked' && live.length > 0;

  return (
    <div
      role="region"
      aria-label="Applied filters"
      className={cx(styles.bar, styles[variant], className)}
    >
      {showCount && (
        <span className={styles.count} aria-live="polite">
          {countLabel}
        </span>
      )}
      {showDivider && <div aria-hidden className={styles.divider} />}

      <div className={cx(styles.chips, variant === 'stacked' ? styles.chipsFull : styles.chipsFlex)}>
        {live.map((c) => (
          <button
            key={keyOf(c)}
            type="button"
            className={cx(styles.chip, styles[`skin_${chipStyle}`])}
            aria-label={`Remove ${showGroups && c.group ? `${c.group} ` : ''}${c.label}`}
            onClick={() => remove(c)}
          >
            {showGroups && c.group && <span className={styles.group}>{c.group}:</span>}
            <span>{c.label}</span>
            <Icon icon={X} size="sm" className={styles.x} />
          </button>
        ))}
        {live.length === 0 && <span className={styles.empty}>{emptyLabel}</span>}
      </div>

      {live.length > 0 && (
        <button type="button" className={styles.clear} onClick={clearAll}>
          {clearLabel}
        </button>
      )}
    </div>
  );
}
