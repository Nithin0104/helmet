import type { CartLine } from '../../src/cart/CartContext';

export const fixtureCartLine: CartLine = {
  id: 'test-helmet|black|m',
  productId: 'test-helmet',
  name: 'Test Helmet',
  brand: 'Apexline',
  price: 19999,
  color: 'black',
  size: 'm',
  qty: 1,
};

export const fixtureCartLines: CartLine[] = [
  fixtureCartLine,
  {
    id: 'test-helmet-full|white|l',
    productId: 'test-helmet-full',
    name: 'Test Helmet Full',
    brand: 'Apexline',
    price: 24999,
    color: 'white',
    size: 'l',
    qty: 2,
  },
];
