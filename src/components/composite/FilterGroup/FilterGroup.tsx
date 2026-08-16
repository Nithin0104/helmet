import { useId, useState } from 'react';
import { Check, ChevronDown, Circle, Search, X } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../../primitives';
import styles from './FilterGroup.module.css';

export type FilterGroupVariant = 'checkbox' | 'radio' | 'pill' | 'swatch';
export type FilterGroupMode = 'multi' | 'single';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  /** Swatch color (for the `swatch` variant). */
  hex?: string;
}

export interface FilterGroupProps {
  title: string;
  /** Small muted note beside the title, e.g. a scope hint ("IN 2 CATEGORIES"). */
  titleNote?: string;
  /** Options as strings or `{ value, label, count?, hex? }`. */
  options: Array<string | FilterOption>;
  variant?: FilterGroupVariant;
  mode?: FilterGroupMode;
  /** Controlled selected values. Omit for uncontrolled (use `defaultValue`). */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  searchable?: boolean;
  showCounts?: boolean;
  collapsible?: boolean;
  /** Controlled collapsed/open state (when `collapsible`). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  searchPlaceholder?: string;
  className?: string;
}

const NAMED_HEX: Record<string, string> = {
  black: '#14141a',
  white: '#e8e8ea',
  red: '#c0392b',
  blue: '#2e6bff',
  silver: '#b8b8bd',
  grey: '#55555c',
  gray: '#55555c',
};

function normalize(options: Array<string | FilterOption>): FilterOption[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

export function FilterGroup({
  title,
  titleNote,
  options,
  variant = 'checkbox',
  mode = 'multi',
  value,
  defaultValue,
  onChange,
  searchable = true,
  showCounts = true,
  collapsible = false,
  open,
  defaultOpen = true,
  onOpenChange,
  searchPlaceholder = 'Search…',
  className,
}: FilterGroupProps) {
  const autoId = useId();
  const opts = normalize(options);
  const single = mode === 'single';
  const isList = variant === 'checkbox' || variant === 'radio';

  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const picked = isControlled ? value : internal;

  const [query, setQuery] = useState('');
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpenControlled = open !== undefined;
  const isOpen = collapsible ? (isOpenControlled ? open : internalOpen) : true;

  const toggle = (v: string) => {
    const next = picked.includes(v)
      ? picked.filter((x) => x !== v)
      : single
        ? [v]
        : [...picked, v];
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const toggleOpen = () => {
    if (!collapsible) return;
    const next = !isOpen;
    if (!isOpenControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const q = query.trim().toLowerCase();
  const shown = opts.filter((o) => !q || o.label.toLowerCase().includes(q) || picked.includes(o.value));
  const noMatch = !!q && shown.length === 0;

  const labelId = `${autoId}-label`;
  const containerRole = single ? 'radiogroup' : 'group';

  return (
    <div className={cx(styles.group, className)} role={containerRole} aria-labelledby={labelId}>
      {collapsible ? (
        <button type="button" className={styles.head} aria-expanded={isOpen} onClick={toggleOpen}>
          <span id={labelId} className={styles.title}>
            {title}
          </span>
          {titleNote && <span className={styles.titleNote}>{titleNote}</span>}
          {picked.length > 0 && <span className={styles.countPill}>{picked.length}</span>}
          <Icon icon={ChevronDown} size="sm" className={cx(styles.chev, !isOpen && styles.chevClosed)} />
        </button>
      ) : (
        <div className={styles.head}>
          <span id={labelId} className={styles.title}>
            {title}
          </span>
          {titleNote && <span className={styles.titleNote}>{titleNote}</span>}
          {picked.length > 0 && <span className={styles.countPill}>{picked.length}</span>}
        </div>
      )}

      {isOpen && (
        <div>
          {searchable && (
            <div className={styles.searchWrap}>
              <Icon icon={Search} size="sm" className={styles.searchIcon} />
              <input
                type="text"
                className={styles.search}
                placeholder={searchPlaceholder}
                aria-label={`Search ${title}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className={styles.clear}
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                >
                  <Icon icon={X} size="sm" />
                </button>
              )}
            </div>
          )}

          {noMatch && <div className={styles.noMatch}>Nothing matches “{query}”</div>}

          {isList && !noMatch && (
            <div className={styles.list}>
              {shown.map((o) => {
                const active = picked.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role={single ? 'radio' : 'checkbox'}
                    aria-checked={active}
                    className={cx(styles.row, active && styles.rowActive)}
                    onClick={() => toggle(o.value)}
                  >
                    <span aria-hidden className={cx(styles.box, single && styles.boxCircle, active && styles.boxActive)}>
                      {active && (
                        <Icon
                          icon={single ? Circle : Check}
                          size={10}
                          strokeWidth={single ? 2 : 2.4}
                          className={styles.mark}
                        />
                      )}
                    </span>
                    <span className={styles.optLabel}>{o.label}</span>
                    {showCounts && o.count != null && <span className={styles.optCount}>{o.count}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {variant === 'pill' && !noMatch && (
            <div className={styles.pillWrap}>
              {shown.map((o) => {
                const active = picked.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={active}
                    className={cx(styles.pill, active && styles.pillActive)}
                    onClick={() => toggle(o.value)}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {variant === 'swatch' && !noMatch && (
            <div className={styles.swatchWrap}>
              {shown.map((o) => {
                const active = picked.includes(o.value);
                const hex = o.hex ?? NAMED_HEX[o.label.toLowerCase()] ?? '#55555c';
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={active}
                    aria-label={o.label}
                    title={o.label}
                    className={cx(styles.swatch, active && styles.swatchActive)}
                    style={{ '--sw': hex } as React.CSSProperties}
                    onClick={() => toggle(o.value)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
