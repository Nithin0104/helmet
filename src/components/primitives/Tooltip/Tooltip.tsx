import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click' | 'focus';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  speed?: number;
  trigger?: TooltipTrigger;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  speed = 0.16,
  trigger = 'hover',
  delay = 120,
  disabled = false,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  const show = () => {
    if (disabled) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  const triggerProps =
    trigger === 'click'
      ? { onClick: () => (disabled ? undefined : setOpen((o) => !o)) }
      : trigger === 'focus'
        ? { onFocus: show, onBlur: hide }
        : { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide };

  return (
    <span
      className={cx(styles.wrap, className)}
      style={{ '--speed': `${speed}s` } as React.CSSProperties}
      aria-describedby={open ? id : undefined}
      {...triggerProps}
    >
      {children}
      {open && !disabled && (
        <span role="tooltip" id={id} className={cx(styles.bubble, styles[placement])}>
          {content}
        </span>
      )}
    </span>
  );
}
