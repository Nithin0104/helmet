import { Accordion } from '../../../components/primitives';
import type { Product } from '../../../data/types';
import styles from '../ProductPage.module.css';

/** Frequently-asked questions accordion. Hidden when the product has no FAQs. */
export function FaqSection({ product }: { product: Product }) {
  const faqs = product.faqs ?? [];
  if (!faqs.length) return null;

  return (
    <section className={styles.section} aria-labelledby="pdp-faq">
      <div className={styles.eyebrow} id="pdp-faq">
        FREQUENTLY ASKED
      </div>
      <Accordion mode="single" items={faqs.map((f) => ({ id: f.id, q: f.question, a: f.answer }))} />
    </section>
  );
}
