import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useCart } from '../../../cart/CartContext';
import { DESKTOP_NAV, MOBILE_NAV, ANNOUNCEMENTS } from '../../../data/navigation';
import type { NavItem } from '../../../data/navigation';
import { Logo } from '../Logo/Logo';
import { AnnounceBanner } from '../AnnounceBanner/AnnounceBanner';
import { SlideNav } from '../SlideNav/SlideNav';
import { SearchPanel } from '../SearchPanel/SearchPanel';
import styles from './SiteHeader.module.css';

export interface SiteHeaderProps {
  /** Current page label to highlight in the nav. Falls back to the route. */
  activePage?: string;
  /** Compact "secure checkout" bar (no nav, no announce strip). */
  minimal?: boolean;
  /** Show the scrolling promo strip above the header (default true). */
  showAnnouncement?: boolean;
  className?: string;
}

/** Derive the active nav label from the path when none is passed explicitly. */
function deriveActive(pathname: string, items: NavItem[]): string {
  const match = items.find((n) => n.href !== '/' && pathname.startsWith(n.href));
  return match?.label ?? '';
}

/** The site's cart badge — reads live count from `useCart`, pops on change. */
function CartBadge() {
  const { count } = useCart();
  if (count <= 0) return null;
  // Re-key on count so the CSS pop animation replays on every change.
  return (
    <span key={count} className={styles.cartDot}>
      {count}
    </span>
  );
}

export function SiteHeader({
  activePage,
  minimal = false,
  showAnnouncement = true,
  className,
}: SiteHeaderProps) {
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeLabel = activePage ?? deriveActive(location.pathname, DESKTOP_NAV);

  const openSearch = () => {
    setSearchOpen(true);
    setNavOpen(false);
  };

  if (minimal) {
    return (
      <header className={cx(styles.minimal, className)}>
        <Logo size="sm" />
        <div className={styles.secure}>
          <span className={styles.lock} aria-hidden>
            🔒
          </span>
          SECURE CHECKOUT
        </div>
      </header>
    );
  }

  const icons = (
    <>
      <button type="button" className={styles.icon} aria-label="Account">
        ☺
      </button>
      <button type="button" className={styles.icon} aria-label="Search" onClick={openSearch}>
        ⌕
      </button>
      <Link to="/cart" className={cx(styles.icon, styles.cartLink)} aria-label="Cart">
        ◫
        <CartBadge />
      </Link>
    </>
  );

  return (
    <>
      {showAnnouncement && <AnnounceBanner messages={ANNOUNCEMENTS} />}

      <div className={styles.sticky}>
        {isDesktop ? (
          <header className={styles.deskHeader}>
            <div className={styles.deskInner}>
              <Logo size="md" />
              <nav className={styles.nav}>
                {DESKTOP_NAV.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={cx(styles.navLink, item.label === activeLabel && styles.navActive)}
                    aria-current={item.label === activeLabel ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className={styles.actions}>{icons}</div>
            </div>
          </header>
        ) : (
          <header className={styles.mobHeader}>
            <button
              type="button"
              className={styles.hamburger}
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
            >
              <span className={styles.bar} />
              <span className={cx(styles.bar, styles.barAccent)} />
              <span className={styles.bar} />
            </button>
            <Logo size="sm" />
            <div className={styles.actions}>{icons}</div>
          </header>
        )}
      </div>

      <SlideNav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        items={MOBILE_NAV}
        active={activeLabel}
      />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
