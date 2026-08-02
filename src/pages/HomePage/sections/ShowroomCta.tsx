import { Link } from 'react-router-dom';
import { SHOWROOM } from '../../../data/home';
import styles from '../HomePage.module.css';

/** Offline showroom CTA panel. */
export function ShowroomCta() {
  return (
    <section className={styles.storeSection} aria-labelledby="store-title">
      <div className={styles.store}>
        <span className={styles.storeTag} aria-hidden>
          [ SHOWROOM INTERIOR ]
        </span>
        <div className={styles.storeInner}>
          <div className={styles.eyebrow}>{SHOWROOM.eyebrow}</div>
          <h2 id="store-title" className={styles.storeHeading}>
            {SHOWROOM.headingTop}
            <br />
            {SHOWROOM.headingBottom}
          </h2>
          <p className={styles.storeCopy}>{SHOWROOM.copy}</p>
          <div className={styles.storeInfo}>
            {SHOWROOM.address}
            <br />
            {SHOWROOM.hours}
          </div>
          <div className={styles.storeCtas}>
            <Link to={SHOWROOM.primary.href} className={styles.ctaPrimary}>
              {SHOWROOM.primary.label}
            </Link>
            <Link to={SHOWROOM.secondary.href} className={styles.storeSecondary}>
              {SHOWROOM.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
