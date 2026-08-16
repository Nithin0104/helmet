import { Tabs, SpecTable, EmptyState, type TabItem } from '../../../components/primitives';
import { ReviewSummary, ProductReview } from '../../../components/composite';
import type { Product } from '../../../data/types';
import type { RatingBucket } from '../../../lib/pdp';
import styles from '../ProductPage.module.css';

export interface DetailTabsProps {
  product: Product;
  distribution: RatingBucket[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Description / Specs / Reviews tabbed panel. Tabs with no data are omitted. */
export function DetailTabs({ product, distribution, activeTab, onTabChange }: DetailTabsProps) {
  const reviews = product.reviews ?? [];
  const items: TabItem[] = [];

  if (product.description) {
    items.push({
      id: 'description',
      label: 'Description',
      content: <p className={styles.descText}>{product.description}</p>,
    });
  }

  if (product.specs?.length) {
    items.push({
      id: 'specs',
      label: 'Specs',
      content: <SpecTable items={product.specs} />,
    });
  }

  items.push({
    id: 'reviews',
    label: 'Reviews',
    content: reviews.length ? (
      <div>
        <div className={styles.reviewSummary}>
          <ReviewSummary score={product.rating} count={product.reviewCount} distribution={distribution} />
        </div>
        {reviews.map((r) => (
          <ProductReview
            key={r.id}
            author={r.author}
            date={formatDate(r.date)}
            rating={r.rating}
            title={r.title}
            body={r.body}
            verified={r.verified}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No reviews yet"
        body="Be the first to review this helmet after your ride."
        variant="panel"
      />
    ),
  });

  // Guard the controlled value against a tab that isn't present for this product.
  const value = items.some((it) => it.id === activeTab) ? activeTab : items[0]?.id;

  return (
    <section className={styles.section} id="reviews">
      <Tabs items={items} variant="underline" value={value} onChange={onTabChange} />
    </section>
  );
}
