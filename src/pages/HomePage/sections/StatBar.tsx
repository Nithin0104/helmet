import { CountUp, Icon } from '../../../components/primitives';
import { iconMap } from '../../../lib/icons';
import { STATS } from '../../../data/home';
import styles from '../HomePage.module.css';

/** Three-up stat bar under the hero (helmets / brands / rating). */
export function StatBar() {
  return (
    <div className={styles.stats}>
      {STATS.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <div className={styles.statValue}>
            <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
            {stat.icon && <Icon icon={iconMap[stat.icon]} size="sm" className={styles.statStar} />}
          </div>
          <div className={styles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
