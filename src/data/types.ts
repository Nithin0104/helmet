export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface SizeOption {
  id: string;
  label: string;
  available: boolean;
  /**
   * Optional units-in-stock count. When present, drives low-stock urgency
   * ("Only N left") and sold-out (`0`) states; `available` stays the fallback
   * when it's absent (a future API might expose one but not the other).
   */
  stock?: number;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified?: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  tagline?: string;
  category: string;
  /** Headline safety certification, e.g. 'ISI', 'ECE 22.06', 'DOT', 'SHARP 5'. */
  certification?: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  description?: string;
  highlights?: string[];
  /**
   * Curated "why this helmet" stat band (big value + caption), e.g.
   * `{ value: '1,350g', label: 'Carbon-fibre shell' }`. Optional — pages fall
   * back to rendering `highlights` as plain feature cards when it's absent.
   */
  highlightStats?: { value: string; label: string }[];
  /**
   * Explicit availability for catalogs that carry no `sizes[]` (accessories,
   * spares, care). When set it wins over the size-derived check in `isInStock`;
   * helmets omit it and stay driven by their size stock. A real API would return
   * a stock flag on these SKUs the same way.
   */
  inStock?: boolean;
  colors?: ColorOption[];
  sizes?: SizeOption[];
  views?: string[];
  specs?: Spec[];
  faqs?: Faq[];
  reviews?: Review[];
  /** Home-rail curation tag: which featured rail this product belongs to. */
  featured?: 'best' | 'new';
}
