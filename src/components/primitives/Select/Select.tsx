import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './Select.module.css';

export type SelectVariant = 'minimal' | 'boxed' | 'pill' | 'underline' | 'solid';
export type SelectPlacement = 'down' | 'up';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options as plain strings (value === label) or `{ value, label, disabled? }`. */
  options: Array<string | SelectOption>;
  /** Controlled selected value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Prefix label shown before the value inside the trigger (e.g. "Sort:"). */
  label?: string;
  /** Shown when nothing is selected and there is no first option to fall back to. */
  placeholder?: string;
  variant?: SelectVariant;
  /** Panel opens below (`down`, default) or above (`up`) the trigger. */
  placement?: SelectPlacement;
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  className?: string;
}

function normalize(options: Array<string | SelectOption>): SelectOption[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = 'Select…',
  variant = 'minimal',
  placement = 'down',
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  className,
}: SelectProps) {
  const opts = normalize(options);
  const autoId = useId();
  const listboxId = `${id ?? autoId}-listbox`;

  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? opts[0]?.value);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const selectedIndex = opts.findIndex((o) => o.value === selected);
  const [activeIndex, setActiveIndex] = useState(selectedIndex < 0 ? 0 : selectedIndex);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedOption = opts[selectedIndex];
  const displayValue = selectedOption?.label ?? placeholder;

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex);
    setOpen(true);
  };

  const pick = (idx: number) => {
    const opt = opts[idx];
    if (!opt || opt.disabled) return;
    if (!isControlled) setInternal(opt.value);
    onChange?.(opt.value);
    close();
  };

  // Focus the active option whenever the menu is open / active index moves.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const step = (dir: 1 | -1) => {
    setActiveIndex((i) => {
      let next = i;
      for (let n = 0; n < opts.length; n++) {
        next = (next + dir + opts.length) % opts.length;
        if (!opts[next]?.disabled) break;
      }
      return next;
    });
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        step(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        step(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(opts.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        pick(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={cx(styles.wrap, className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        className={cx(styles.trigger, styles[variant])}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.value}>{displayValue}</span>
        <Icon icon={ChevronDown} size="sm" className={cx(styles.caret, open && styles.caretOpen)} />
      </button>

      {open && (
        <ul
          role="listbox"
          id={listboxId}
          aria-label={ariaLabel ?? label}
          className={cx(styles.panel, placement === 'up' && styles.panelUp, styles[`panel_${variant}`])}
          style={{ '--sel-anim': placement === 'up' ? 'selRise' : 'selDrop' } as CSSProperties}
          onKeyDown={onListKeyDown}
        >
          {opts.map((o, i) => {
            const isSelected = o.value === selected;
            return (
              <li key={o.value} role="none">
                <button
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={o.disabled}
                  tabIndex={-1}
                  className={cx(styles.option, isSelected && styles.optionSelected)}
                  onClick={() => pick(i)}
                >
                  <span className={styles.optionLabel}>{o.label}</span>
                  {isSelected && <Icon icon={Check} size="sm" className={styles.tick} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
