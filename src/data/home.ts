/**
 * Home page content (hero, stats, categories, why-us, showroom, compare). Kept
 * as data so the HomePage sections stay presentational and copy can change
 * without touching components — the CMS/API seam a backend fills later.
 * Localized to India (₹, Bengaluru), not the DC source's £/London.
 */

export interface CtaLink {
  label: string;
  href: string;
}

export interface HomeHeroContent {
  badge: string;
  headlineTop: string;
  headlineAccent: string;
  headlineBottom: string;
  copy: string;
  primary: CtaLink;
  secondary: CtaLink;
}

export const HERO: HomeHeroContent = {
  badge: 'LIMITED · SUMMER SALE',
  headlineTop: 'Up to',
  headlineAccent: '30% off',
  headlineBottom: 'select lids',
  copy: "Flagship helmets, gear and spares — reduced for a limited run. When they're gone, they're gone.",
  primary: { label: 'Shop offers', href: '/shop' },
  secondary: { label: 'New in', href: '/shop' },
};

export interface HomeStat {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
}

export const STATS: HomeStat[] = [
  { value: 200, suffix: '+', label: 'Helmets' },
  { value: 10, suffix: '+', label: 'Brands' },
  { value: 4.9, decimals: 1, suffix: '★', label: 'Rated' },
];

export interface HomeCategory {
  kicker: string;
  title: string;
  caption: string;
  href: string;
}

export const CATEGORIES: HomeCategory[] = [
  { kicker: 'CAT 01', title: 'Helmets', caption: 'Full-face · modular · open', href: '/shop' },
  { kicker: 'CAT 02', title: 'Spares', caption: 'Visors · liners · straps', href: '/shop' },
  { kicker: 'CAT 03', title: 'Accessories', caption: 'Gloves · intercoms · jackets', href: '/shop' },
  { kicker: 'CAT 04', title: 'Care', caption: 'Cleaners · anti-fog · bags', href: '/shop' },
];

export interface WhyUsItem {
  icon: string;
  title: string;
  body: string;
}

export const WHY_US: WhyUsItem[] = [
  { icon: '✔', title: '100% genuine', body: 'Every helmet sourced direct from the brand. No fakes, ever.' },
  { icon: '◈', title: '10+ brands', body: 'The widest range under one roof, online and in store.' },
  { icon: '⌂', title: 'Physical store', body: 'Come browse, try helmets on and talk to the team in person.' },
  { icon: '☎', title: 'Great support', body: 'Real riders on hand to help before and after you buy.' },
];

export interface CompareContent {
  eyebrow: string;
  heading: string;
  copy: string;
  link: CtaLink;
}

export const COMPARE: CompareContent = {
  eyebrow: 'COMPARE',
  heading: 'Weigh up to 3 helmets side by side.',
  copy: 'Safety rating, weight, shell size, ventilation, price — all lined up so you can choose with confidence.',
  link: { label: 'Start comparing →', href: '/shop' },
};

export interface ShowroomContent {
  eyebrow: string;
  headingTop: string;
  headingBottom: string;
  copy: string;
  address: string;
  hours: string;
  primary: CtaLink;
  secondary: CtaLink;
}

export const SHOWROOM: ShowroomContent = {
  eyebrow: 'VISIT THE SHOWROOM',
  headingTop: 'See it. Hold it.',
  headingBottom: 'Ride out.',
  copy: 'Hundreds of helmets on the wall and every major brand under one roof. Come browse the full range in person and talk gear with people who ride.',
  address: 'UNIT 4, RIVERSIDE WORKS · BENGALURU',
  hours: 'OPEN MON–SAT · 10AM–8PM',
  primary: { label: 'Get directions', href: '/shop' },
  secondary: { label: 'Store hours', href: '/shop' },
};

export interface HomeReview {
  quote: string;
  name: string;
  model: string;
  /** Star rating for this testimonial (1–5). Rendered on the review card. */
  rating: number;
}

export const HOME_REVIEWS: HomeReview[] = [
  {
    quote: 'Best helmet shop I’ve walked into — hundreds on the wall and staff who actually ride.',
    name: 'Marcus D.',
    model: 'Velocity RS',
    rating: 5,
  },
  {
    quote: 'Ordered a replacement visor, arrived next day and fit perfectly. These people know their stuff.',
    name: 'Priya S.',
    model: 'Urban GT',
    rating: 5,
  },
  {
    quote: 'Huge range and honest advice. Walked out with the right lid and zero regrets.',
    name: 'Tom W.',
    model: 'Trail Pro ADV',
    rating: 4,
  },
  {
    quote: 'Great prices and the intercom I bought paired first time. Proper gear shop.',
    name: 'Aisha K.',
    model: 'Comlink Intercom',
    rating: 5,
  },
];

/**
 * Overall store rating shown in the reviews section header. Numbers, not
 * display strings — formatted at the edge (score via toFixed, count via
 * `formatCompact`) so the data stays consistent with `STATS` and API-ready.
 */
export const STORE_RATING = { score: 4.9, count: 2100 };
