import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Icon } from '../../../components/primitives';
import { CategoryCard } from '../../../components/composite';
import { CATEGORIES } from '../../../data/home';
import styles from '../HomePage.module.css';

/** "Shop the range" — category tiles linking into the catalog. */
export function CategoryStrip() {
  return (
    <section className={styles.section} aria-labelledby="range-title">
      <div className={styles.sectionHead}>
        <h2 id="range-title" className={styles.sectionTitle}>
          Shop the range
        </h2>
        <Link to="/shop" className={styles.seeAll}>
          ALL <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>
      <div className={styles.categories}>
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.title}
            kicker={category.kicker}
            title={category.title}
            caption={category.caption}
            href={category.href}
          />
        ))}
      </div>
    </section>
  );
}
