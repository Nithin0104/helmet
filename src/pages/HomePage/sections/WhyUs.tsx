import { WHY_US } from '../../../data/home';
import styles from '../HomePage.module.css';

/** "Why APEXLINE" — four trust/feature cards. */
export function WhyUs() {
  return (
    <section className={styles.section} aria-labelledby="why-title">
      <div className={styles.eyebrow}>WHY APEXLINE</div>
      <h2 id="why-title" className={styles.whyHeading}>
        Bought right,
        <br />
        backed for life.
      </h2>
      <div className={styles.why}>
        {WHY_US.map((item) => (
          <div key={item.title} className={styles.whyCard}>
            <span className={styles.whyIcon} aria-hidden>
              {item.icon}
            </span>
            <div className={styles.whyTitle}>{item.title}</div>
            <div className={styles.whyBody}>{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
