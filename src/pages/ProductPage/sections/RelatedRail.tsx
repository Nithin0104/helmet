import { ProductRail } from '../../../components/composite';
import type { Product } from '../../../data/types';

/** "You may also like" — related helmets in a responsive grid. */
export function RelatedRail({ items }: { items: Product[] }) {
  if (!items.length) return null;
  return (
    <ProductRail
      title="You may also like"
      items={items}
      layout="grid"
      seeAllHref="/shop"
      seeAllLabel="ALL HELMETS"
      sectionId="pdp-related"
      limit={4}
    />
  );
}
