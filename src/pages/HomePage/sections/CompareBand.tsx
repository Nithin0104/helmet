import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import { COMPARE } from '../../../data/home';
import styles from '../HomePage.module.css';

/** Compare-tool CTA band (static promo — the comparison feature is deferred). */
export function CompareBand() {
  return (
    <section className={styles.section} aria-labelledby="compare-title">
      <div className={styles.compare}>
        <div className={styles.compareText}>
          <div className={styles.eyebrow}>{COMPARE.eyebrow}</div>
          <h2 id="compare-title" className={styles.compareHeading}>
            {COMPARE.heading}
          </h2>
          <p className={styles.compareCopy}>{COMPARE.copy}</p>
          <Link to={COMPARE.link.href} className={styles.compareLink}>
            {COMPARE.link.label}
          </Link>
        </div>
        <div className={styles.compareVisual} aria-hidden>
          <div className={styles.compareTile}>A</div>
          <div className={cx(styles.compareTile, styles.compareTileB)}>B</div>
          <div className={styles.compareTilePlus}>+</div>
        </div>
      </div>
    </section>
  );
}
