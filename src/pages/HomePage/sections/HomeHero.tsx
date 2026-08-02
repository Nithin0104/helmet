import { Link } from 'react-router-dom';
import { HERO } from '../../../data/home';
import styles from '../HomePage.module.css';
import { StatBar } from './StatBar';

/** Hero offer banner + stat bar (above the fold). */
export function HomeHero() {
  return (
    <section className={styles.heroSection} aria-label="Featured offer">
      <div className={styles.hero}>
        <span className={styles.heroTag} aria-hidden>
          [ CAMPAIGN SHOT ]
        </span>
        <div className={styles.heroBadge}>{HERO.badge}</div>
        <div className={styles.heroInner}>
          <h1
            className={styles.heroTitle}
            aria-label={`${HERO.headlineTop} ${HERO.headlineAccent} ${HERO.headlineBottom}`}
          >
            {HERO.headlineTop}
            <br />
            <span className={styles.heroAccent}>{HERO.headlineAccent}</span>
            <br />
            {HERO.headlineBottom}
          </h1>
          <p className={styles.heroCopy}>{HERO.copy}</p>
          <div className={styles.heroCtas}>
            <Link to={HERO.primary.href} className={styles.ctaPrimary}>
              {HERO.primary.label}
            </Link>
            <Link to={HERO.secondary.href} className={styles.ctaGhost}>
              {HERO.secondary.label}
            </Link>
          </div>
        </div>
      </div>
      <StatBar />
    </section>
  );
}
