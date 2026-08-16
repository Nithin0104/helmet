import type { Product } from '../../src/data/types';

export const fixtureProduct: Product = {
  id: 'test-helmet',
  name: 'Test Helmet',
  brand: 'Apexline',
  category: 'Full-face',
  price: 19999,
  rating: 4.5,
  reviewCount: 10,
};

export const fixtureProductFull: Product = {
  ...fixtureProduct,
  id: 'test-helmet-full',
  tagline: 'Built for testing',
  compareAtPrice: 24999,
  badge: 'New',
  description: 'A fixture helmet with every optional field populated.',
  highlights: ['Highlight one', 'Highlight two'],
  colors: [
    { id: 'black', name: 'Black', hex: '#111111' },
    { id: 'white', name: 'White', hex: '#f4f3f1' },
  ],
  sizes: [
    { id: 'm', label: 'M', available: true },
    { id: 'l', label: 'L', available: false },
  ],
  views: ['/fixtures/view-1.png'],
  specs: [{ label: 'Weight', value: '1200g' }],
  faqs: [{ id: 'faq-1', question: 'Is it washable?', answer: 'Yes, the liner is removable.' }],
  reviews: [
    {
      id: 'rev-1',
      author: 'Test User',
      rating: 5,
      date: '2026-01-01',
      title: 'Great',
      body: 'Works well.',
      verified: true,
    },
  ],
};

export const fixtureProducts: Product[] = [fixtureProduct, fixtureProductFull];
