import type { Product } from './types';

const VELOCITY_COLORS = [
  { id: 'matte-black', name: 'Matte Black', hex: '#1a1a1c' },
  { id: 'carbon-fiber', name: 'Carbon Fiber', hex: '#2b2d31' },
  { id: 'racing-red', name: 'Racing Red', hex: '#c0392b' },
  { id: 'pearl-white', name: 'Pearl White', hex: '#f4f3f1' },
  { id: 'gunmetal-grey', name: 'Gunmetal Grey', hex: '#5a5d63' },
];

const HELMET_SIZES = [
  { id: 'xs', label: 'XS (53-54cm)', available: true },
  { id: 's', label: 'S (55-56cm)', available: true },
  { id: 'm', label: 'M (57-58cm)', available: true },
  { id: 'l', label: 'L (59-60cm)', available: true },
  { id: 'xl', label: 'XL (61-62cm)', available: false },
  { id: 'xxl', label: 'XXL (63-64cm)', available: false },
];

export const PRODUCTS: Product[] = [
  {
    id: 'velocity-rs-carbon',
    name: 'Velocity RS Carbon',
    brand: 'Apexline',
    tagline: 'Race-bred carbon shell for the track and the highway',
    category: 'Full-face',
    price: 42999,
    compareAtPrice: 47999,
    rating: 4.7,
    reviewCount: 128,
    badge: 'Bestseller',
    description:
      'The Velocity RS Carbon is our flagship full-face helmet, built on a hand-laid carbon-fibre ' +
      'shell that drops weight without giving up crash protection. Track-tested aerodynamics, a ' +
      'wide anti-fog visor, and a fully removable liner make it equally at home on a Sunday canyon ' +
      'run or the daily commute through city traffic.',
    highlights: [
      'Hand-laid carbon-fibre shell, 3 shell sizes for a precise fit',
      'ISI + ECE 22.06 certified',
      '1,350g average weight (M shell)',
      'Anti-fog, anti-scratch visor with tool-less removal',
      'Removable, washable, moisture-wicking liner',
    ],
    colors: VELOCITY_COLORS,
    sizes: HELMET_SIZES,
    views: ['front', 'three-quarter', 'side', 'back', 'visor-up'],
    specs: [
      { label: 'Shell material', value: 'Carbon fibre composite' },
      { label: 'Certification', value: 'ISI, ECE 22.06' },
      { label: 'Weight', value: '1,350g ± 50g (size M)' },
      { label: 'Visor', value: 'Anti-fog, anti-scratch, UV400' },
      { label: 'Ventilation', value: '4 intake + 2 exhaust vents' },
      { label: 'Liner', value: 'Removable, washable, moisture-wicking' },
      { label: 'Retention system', value: 'Double-D ring' },
      { label: 'Warranty', value: '5 years manufacturer warranty' },
    ],
    faqs: [
      {
        id: 'sizing',
        question: 'How do I pick the right size?',
        answer:
          'Measure your head circumference just above the eyebrows and match it against the size ' +
          'chart in the size selector. If you fall between two sizes, we recommend sizing down for a ' +
          'snug fit that loosens slightly as the liner breaks in.',
      },
      {
        id: 'certification',
        question: 'Is this helmet legal to ride with in India?',
        answer:
          'Yes — the Velocity RS Carbon carries ISI certification, which is mandatory under Indian ' +
          'motor vehicle rules, alongside ECE 22.06 for international touring.',
      },
      {
        id: 'returns',
        question: 'What is the return policy?',
        answer:
          'Unused helmets with tags and the original box can be returned within 15 days of delivery ' +
          'for a full refund. Worn or damaged helmets cannot be returned for hygiene and safety reasons.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Aditya Rao',
        rating: 5,
        date: '2026-05-12',
        title: 'Worth every rupee',
        body:
          'Been riding with this for three months on the Mumbai-Pune expressway. Barely notice the ' +
          'weight and zero wind noise at 100kmph. The visor seal keeps the rain out too.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Meera Nair',
        rating: 5,
        date: '2026-04-28',
        title: 'Finally a helmet that fits Indian head shapes',
        body:
          'Most imported shells feel too oval for me. The M shell fit perfectly out of the box and the ' +
          'cheek pads broke in within a week.',
        verified: true,
      },
      {
        id: 'r3',
        author: 'Karthik Subramaniam',
        rating: 4,
        date: '2026-03-30',
        title: 'Great helmet, ventilation could be better in peak summer',
        body:
          'Protection and finish are excellent. In Chennai traffic during April it does get warm at ' +
          'low speeds, but at highway speed the vents do their job.',
        verified: true,
      },
    ],
  },
  {
    id: 'iridium-gp',
    name: 'Iridium GP',
    brand: 'Apexline',
    tagline: 'MotoGP-inspired shell for serious track days',
    category: 'Full-face',
    price: 34999,
    rating: 4.6,
    reviewCount: 84,
    badge: 'Track Ready',
  },
  {
    id: 'circuit-r',
    name: 'Circuit R',
    brand: 'Apexline',
    tagline: 'Everyday sport riding, race-day sharp',
    category: 'Full-face',
    price: 18999,
    rating: 4.4,
    reviewCount: 156,
  },
  {
    id: 'urban-gt-modular',
    name: 'Urban GT Modular',
    brand: 'Apexline',
    tagline: 'Flip up the chin bar, stay in the saddle',
    category: 'Modular',
    price: 15499,
    compareAtPrice: 17999,
    rating: 4.3,
    reviewCount: 211,
    badge: 'City Favourite',
  },
  {
    id: 'trail-pro-adv',
    name: 'Trail Pro ADV',
    brand: 'Apexline',
    tagline: 'Built for gravel, tarmac, and everything between',
    category: 'Adventure',
    price: 22999,
    rating: 4.5,
    reviewCount: 97,
  },
  {
    id: 'vega-tour',
    name: 'Vega Tour',
    brand: 'Apexline',
    tagline: 'All-day comfort for the long haul',
    category: 'Touring',
    price: 12999,
    rating: 4.2,
    reviewCount: 143,
  },
  {
    id: 'noir-track',
    name: 'Noir Track',
    brand: 'Apexline',
    tagline: 'Minimalist shell, maximalist protection',
    category: 'Full-face',
    price: 27999,
    rating: 4.5,
    reviewCount: 62,
    badge: 'New',
  },
  {
    id: 'summit-adv-carbon',
    name: 'Summit ADV Carbon',
    brand: 'Apexline',
    tagline: 'The carbon adventure shell for cross-country riders',
    category: 'Adventure',
    price: 39999,
    compareAtPrice: 43999,
    rating: 4.6,
    reviewCount: 51,
    badge: 'Premium',
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
