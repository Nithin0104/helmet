/**
 * Site chrome content (nav, footer, announce bar, search affordances). Kept as
 * data so the header/footer/search stay presentational and copy can change
 * without touching components — the same seam a CMS or API would fill later.
 */

export interface NavItem {
  label: string;
  href: string;
}

/** Desktop top-nav (DC: Helmets, Accessories, Brands, Showroom). */
export const DESKTOP_NAV: NavItem[] = [
  { label: 'Helmets', href: '/shop' },
  { label: 'Accessories', href: '/shop' },
  { label: 'Brands', href: '/shop' },
  { label: 'Showroom', href: '/showcase' },
];

/** Mobile slide-nav has one extra entry (DC adds "Care"). */
export const MOBILE_NAV: NavItem[] = [
  { label: 'Helmets', href: '/shop' },
  { label: 'Accessories', href: '/shop' },
  { label: 'Brands', href: '/shop' },
  { label: 'Care', href: '/shop' },
  { label: 'Showroom', href: '/showcase' },
];

/** Scrolling promo strip messages. */
export const ANNOUNCEMENTS: string[] = [
  '★ FREE SHIPPING OVER ₹4,999',
  'VISIT OUR PHYSICAL SHOWROOM',
  '10+ BRANDS IN STOCK',
  'EXPERT CUSTOMER SUPPORT',
];

/** Default trending search terms shown in an empty SearchPanel. */
export const TRENDING: string[] = [
  'Velocity RS',
  'Modular',
  'Track',
  'Carbon',
  'Adventure',
  'Touring',
];

/** Brand names for the marquee strip on the home page — the real brands APEXLINE stocks. */
export const BRANDS: string[] = [
  'MT HELMETS',
  'SMK',
  'AXOR',
  'VEGA',
  'STEELBIRD',
  'STUDDS',
  'ROYAL ENFIELD',
];

export interface FooterColumn {
  h: string;
  items: string[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  { h: 'SHOP', items: ['Helmets', 'Spares', 'Accessories', 'Care'] },
  { h: 'HELP', items: ['Size guide', 'Delivery', 'Returns', 'Contact'] },
  { h: 'COMPANY', items: ['The showroom', 'Our brands', 'Offers', 'Reviews'] },
  { h: 'FOLLOW', items: ['Instagram', 'YouTube', 'TikTok'] },
];

export const FOOTER_ADDRESS = 'UNIT 4, RIVERSIDE WORKS · BENGALURU';
export const FOOTER_COPYRIGHT = '© 2026 APEXLINE HELMETS — ALL RIGHTS RESERVED';
