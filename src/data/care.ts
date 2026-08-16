import type { Product } from './types';

/**
 * Helmet-care catalog — cleaning, anti-fog, storage and finish-care products.
 * Kept separate from `PRODUCTS`/`ACCESSORIES` so it can feed its own home rail
 * (and a future care PLP) without inheriting the helmet uniform-detail contract.
 * Only the fields a `ProductCard` renders; same future-API-shape seam, real
 * Indian-market brands, prices in integer rupees.
 */
export const CARE: Product[] = [
  {
    id: 'anti-fog-visor-kit',
    featured: 'best',
    name: 'Anti-Fog Visor Kit',
    brand: 'Vega',
    tagline: 'Anti-fog spray, microfibre and visor cleaner',
    category: 'Care',
    price: 1299,
    rating: 4.6,
    reviewCount: 128,
    badge: 'Bestseller',
  },
  {
    id: 'helmet-fresh-spray',
    featured: 'best',
    name: 'Helmet Fresh Spray',
    brand: 'Studds',
    tagline: 'Antibacterial interior deodoriser for liners',
    category: 'Care',
    price: 599,
    rating: 4.4,
    reviewCount: 96,
  },
  {
    id: 'visor-clean-microfibre',
    featured: 'best',
    name: 'Visor Clean & Microfibre',
    brand: 'MT Helmets',
    tagline: 'Streak-free visor cleaner with two cloths',
    category: 'Care',
    price: 799,
    rating: 4.7,
    reviewCount: 154,
  },
  {
    id: 'matte-shell-restorer',
    featured: 'new',
    name: 'Matte Shell Restorer',
    brand: 'Axor',
    tagline: 'Revives matte finishes without shine or residue',
    category: 'Care',
    price: 999,
    rating: 4.5,
    reviewCount: 61,
    badge: 'New',
  },
  {
    id: 'padded-helmet-bag',
    featured: 'new',
    name: 'Padded Helmet Bag',
    brand: 'SMK',
    tagline: 'Fleece-lined drawstring bag with visor pocket',
    category: 'Care',
    price: 1499,
    rating: 4.8,
    reviewCount: 73,
    badge: 'New',
  },
];

export function getCareProduct(id: string): Product | undefined {
  return CARE.find((item) => item.id === id);
}
