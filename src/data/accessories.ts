import type { Product } from './types';

/**
 * Accessories catalog — kept separate from the helmet `PRODUCTS` so it can feed
 * the home rails (and a future accessories PLP) without inheriting the helmet
 * uniform-detail contract. These only carry the fields a `ProductCard` renders;
 * a full accessories PDP/PLP is a later step. Same future-API-shape seam, real
 * Indian-market brands, prices in integer rupees.
 */
export const ACCESSORIES: Product[] = [
  {
    id: 'pro-race-gloves',
    featured: 'best',
    name: 'Pro Race Gloves',
    brand: 'Axor',
    tagline: 'Knuckle armour and touchscreen fingertips',
    category: 'Gloves',
    price: 4999,
    rating: 4.8,
    reviewCount: 204,
    badge: 'Bestseller',
  },
  {
    id: 'comlink-intercom',
    featured: 'best',
    name: 'Comlink Intercom',
    brand: 'SMK',
    tagline: 'Rider-to-rider comms up to 1km',
    category: 'Comms',
    price: 9999,
    rating: 4.7,
    reviewCount: 132,
    badge: 'Bestseller',
  },
  {
    id: 'tour-textile-jacket',
    featured: 'best',
    name: 'Tour Textile Jacket',
    brand: 'Royal Enfield',
    tagline: 'All-weather touring shell with CE armour',
    category: 'Jacket',
    price: 12999,
    rating: 4.6,
    reviewCount: 77,
  },
  {
    id: 'iridium-visor',
    featured: 'best',
    name: 'Iridium Visor',
    brand: 'MT Helmets',
    tagline: 'Mirror-finish anti-scratch replacement visor',
    category: 'Visor',
    price: 2999,
    rating: 4.9,
    reviewCount: 311,
  },
  {
    id: 'kevlar-riding-jeans',
    featured: 'new',
    name: 'Kevlar Riding Jeans',
    brand: 'Steelbird',
    tagline: 'Abrasion-resistant denim with knee armour',
    category: 'Riding Jeans',
    price: 8999,
    rating: 4.5,
    reviewCount: 42,
    badge: 'New',
  },
  {
    id: 'winter-gauntlet-gloves',
    featured: 'new',
    name: 'Winter Gauntlet Gloves',
    brand: 'Studds',
    tagline: 'Insulated, water-resistant cold-weather gauntlets',
    category: 'Gloves',
    price: 3499,
    rating: 4.4,
    reviewCount: 58,
    badge: 'New',
  },
  {
    id: 'anti-fog-care-kit',
    featured: 'new',
    name: 'Anti-Fog Care Kit',
    brand: 'Vega',
    tagline: 'Anti-fog spray, microfibre and visor cleaner',
    category: 'Care',
    price: 1299,
    rating: 4.6,
    reviewCount: 90,
    badge: 'New',
  },
  {
    id: 'tinted-visor-pro',
    featured: 'new',
    name: 'Tinted Visor Pro',
    brand: 'MT Helmets',
    tagline: 'Smoke-tint visor for bright-day glare',
    category: 'Visor',
    price: 3499,
    rating: 4.7,
    reviewCount: 120,
    badge: 'New',
  },
];

export function getAccessory(id: string): Product | undefined {
  return ACCESSORIES.find((accessory) => accessory.id === id);
}
