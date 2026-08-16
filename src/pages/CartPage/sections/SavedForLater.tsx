import { CartLineItem } from '../../../components/composite';
import type { DisplayLine } from '../../../lib/cart';
import styles from './SavedForLater.module.css';

export interface SavedForLaterProps {
  items: DisplayLine[];
  onMoveToBag: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * "Saved for later" list — lives outside the bag so it survives an emptied cart.
 * Each row reuses `CartLineItem` in its `saved` variant (no stepper; Save flips
 * to "Move to bag"). Renders nothing when there's nothing saved.
 */
export function SavedForLater({ items, onMoveToBag, onRemove }: SavedForLaterProps) {
  if (!items.length) return null;

  return (
    <section className={styles.root} aria-label="Saved for later">
      <div className={styles.heading}>SAVED FOR LATER · {items.length}</div>
      {items.map((line) => (
        <CartLineItem
          key={line.id}
          saved
          brand={line.brand}
          model={line.model}
          type={line.type}
          color={line.color}
          colorHex={line.colorHex}
          size={line.sizeLabel}
          price={line.price}
          qty={line.qty}
          stock={line.stock}
          onSave={() => onMoveToBag(line.id)}
          onRemove={() => onRemove(line.id)}
        />
      ))}
    </section>
  );
}
