import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import type { NavItem } from '../../../data/navigation';
import { MOBILE_NAV } from '../../../data/navigation';
import styles from './SlideNav.module.css';

export interface SlideNavProps {
  open: boolean;
  onClose: () => void;
  items?: NavItem[];
  /** Label of the current page, highlighted in the list. */
  active?: string;
  className?: string;
}

/** Full-screen mobile navigation overlay. */
export function SlideNav({ open, onClose, items = MOBILE_NAV, active, className }: SlideNavProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, { onEscape: onClose });

  if (!open) return null;

  const activeLabel = (active ?? '').toLowerCase();

  return createPortal(
    <div
      ref={ref}
      className={cx(styles.overlay, className)}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className={styles.top}>
        <span className={styles.eyebrow}>MENU</span>
        <button type="button" className={styles.close} aria-label="Close menu" onClick={onClose}>
          ×
        </button>
      </div>

      <nav className={styles.list}>
        {items.map((item, i) => (
          <Link
            key={item.label}
            to={item.href}
            onClick={onClose}
            className={cx(styles.link, item.label.toLowerCase() === activeLabel && styles.active)}
            aria-current={item.label.toLowerCase() === activeLabel ? 'page' : undefined}
          >
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.contact}>
        SHOWROOM · MON–SAT 9–7
        <br />
        UNIT 4, RIVERSIDE WORKS
        <br />
        +91 80 4718 0812
      </div>
    </div>,
    document.body,
  );
}
