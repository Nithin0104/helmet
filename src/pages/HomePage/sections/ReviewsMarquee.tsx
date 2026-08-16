import { Star } from 'lucide-react';
import { Icon, Marquee } from '../../../components/primitives';
import { ReviewCard } from '../../../components/composite';
import { formatCompact } from '../../../lib/format';
import { HOME_REVIEWS, STORE_RATING } from '../../../data/home';
import styles from '../HomePage.module.css';

/** Auto-scrolling wall of rider reviews. */
export function ReviewsMarquee() {
  // The marquee loops seamlessly only when one track is wider than the row;
  // four testimonials aren't, so repeat them to fill it and close the gap.
  const loop = [...HOME_REVIEWS, ...HOME_REVIEWS];
  const items = loop.map((review, i) => (
    <ReviewCard
      key={`${i}-${review.name}`}
      review={{
        id: `home-review-${i}`,
        author: review.name,
        rating: review.rating,
        date: '',
        title: '',
        body: review.quote,
      }}
      model={review.model}
    />
  ));

  return (
    <section className={styles.reviews} aria-labelledby="reviews-title">
      <div className={styles.reviewsHead}>
        <h2 id="reviews-title" className={styles.sectionTitle}>
          Riders rate us
        </h2>
        <span className={styles.reviewRating}>
          <Icon icon={Star} size="sm" className={styles.reviewStar} /> {STORE_RATING.score.toFixed(1)}{' '}
          <span className={styles.reviewRatingCount}>/ {formatCompact(STORE_RATING.count)}</span>
        </span>
      </div>
      <Marquee items={items} speed={40} gap={12} />
    </section>
  );
}
