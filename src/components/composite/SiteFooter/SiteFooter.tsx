import { Logo } from '../Logo/Logo';
import { cx } from '../../../lib/cx';
import type { FooterColumn } from '../../../data/navigation';
import { FOOTER_COLUMNS, FOOTER_ADDRESS, FOOTER_COPYRIGHT } from '../../../data/navigation';
import styles from './SiteFooter.module.css';

export interface SiteFooterProps {
  columns?: FooterColumn[];
  showLogo?: boolean;
  maxWidth?: number;
  address?: string;
  copyright?: string;
  className?: string;
}

/** Site-wide footer: brand mark, link columns, and the legal/address line. */
export function SiteFooter({
  columns = FOOTER_COLUMNS,
  showLogo = true,
  maxWidth = 1280,
  address = FOOTER_ADDRESS,
  copyright = FOOTER_COPYRIGHT,
  className,
}: SiteFooterProps) {
  return (
    <footer className={cx(styles.footer, className)}>
      <div className={styles.inner} style={{ maxWidth }}>
        {showLogo && <Logo size="lg" className={styles.logo} />}
        <div className={styles.cols}>
          {columns.map((col) => (
            <div key={col.h}>
              <div className={styles.colHead}>{col.h}</div>
              {col.items.map((item) => (
                <a key={item} href="#" className={styles.link}>
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.legal}>
          {address}
          <br />
          {copyright}
        </div>
      </div>
    </footer>
  );
}
