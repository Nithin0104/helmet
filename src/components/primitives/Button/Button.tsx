import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'lift' | 'fill' | 'shine' | 'ghost' | 'icon' | 'press' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  children?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: 'button';
  };

type ButtonAsAnchor = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: 'a';
    href?: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button(props: ButtonProps) {
  const {
    variant = 'fill',
    size = 'md',
    label,
    children,
    loading = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    className,
    ...rest
  } = props;

  const content = children ?? label;

  const classes = cx(
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  );

  const inner = (
    <>
      {loading && <span className={styles.spinner} aria-hidden />}
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {content != null && <span className={styles.text}>{content}</span>}
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </>
  );

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      as?: 'a';
    };
    return (
      <a className={classes} aria-busy={loading || undefined} {...anchorRest}>
        {inner}
      </a>
    );
  }

  const { as: _as, type = 'button', disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };
  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonRest}
    >
      {inner}
    </button>
  );
}
