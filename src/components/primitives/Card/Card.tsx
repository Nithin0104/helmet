import type { ReactNode, HTMLAttributes } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Card.module.css';

export type CardVariant = 'product' | 'category' | 'review' | 'feature';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  variant?: CardVariant;
  title?: ReactNode;
  brand?: ReactNode;
  price?: number | string;
  media?: ReactNode;
  image?: string;
  href?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

function formatPrice(price: number | string): string {
  if (typeof price === 'string') return price;
  return '₹' + price.toLocaleString('en-IN');
}

export function Card({
  variant = 'product',
  title,
  brand,
  price,
  media,
  image,
  href,
  badge,
  footer,
  children,
  className,
  onClick,
  ...rest
}: CardProps) {
  const interactive = Boolean(href || onClick);
  const showMedia = variant === 'product' || variant === 'category' || media != null || image != null;

  const body = (
    <>
      {showMedia && (
        <div className={styles.media}>
          {media ?? (image ? <img src={image} alt="" /> : <div className={styles.placeholder} aria-hidden />)}
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
      )}
      <div className={styles.body}>
        {brand && <span className={styles.brand}>{brand}</span>}
        {title && <h3 className={styles.title}>{title}</h3>}
        {children && <div className={styles.content}>{children}</div>}
        {price != null && <span className={styles.price}>{formatPrice(price)}</span>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );

  const classes = cx(styles.card, styles[variant], interactive && styles.interactive, className);

  if (href) {
    return (
      <a className={classes} href={href} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
        {body}
      </a>
    );
  }

  return (
    <article className={classes} onClick={onClick} {...rest}>
      {body}
    </article>
  );
}
