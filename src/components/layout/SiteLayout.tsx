import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { SiteHeader } from '../composite/SiteHeader/SiteHeader';
import { SiteFooter } from '../composite/SiteFooter/SiteFooter';
import styles from './SiteLayout.module.css';

export interface SiteLayoutProps {
  /** Checkout shell: compact header, no footer, no announce strip. */
  minimal?: boolean;
  /** Current page label, forwarded to the header nav. */
  activePage?: string;
  /** Page content. Defaults to the router `<Outlet/>`. */
  children?: ReactNode;
  className?: string;
}

/** App shell wrapping every page: header, main content, footer, ambient glow. */
export function SiteLayout({ minimal = false, activePage, children, className }: SiteLayoutProps) {
  return (
    <div className={cx(styles.shell, className)}>
      <div className={styles.glow} aria-hidden />
      <SiteHeader minimal={minimal} activePage={activePage} showAnnouncement={!minimal} />
      <main className={styles.main}>{children ?? <Outlet />}</main>
      {!minimal && <SiteFooter />}
    </div>
  );
}
