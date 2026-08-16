/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { CartProvider } from '../../src/cart/CartContext';
import { WishlistProvider } from '../../src/wishlist/WishlistContext';
import type { AccentKey } from '../../src/theme/accents';
import type { CartLine } from '../../src/cart/CartContext';

const ACCENT_STORAGE_KEY = 'apex_accent';
const CART_STORAGE_KEY = 'apex_cart';
const SAVED_STORAGE_KEY = 'apex_saved';
const WISHLIST_STORAGE_KEY = 'apex_wishlist';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Pre-seeds localStorage so ThemeProvider hydrates with this accent. */
  accent?: AccentKey;
  /** Pre-seeds localStorage so CartProvider hydrates with these lines. */
  initialCart?: CartLine[];
  /** Pre-seeds localStorage so CartProvider hydrates its saved-for-later list. */
  initialSaved?: CartLine[];
  /** Pre-seeds localStorage so WishlistProvider hydrates with these product ids. */
  initialWishlist?: string[];
  /** Wrap in a MemoryRouter starting at this path (for components using Link/Outlet). */
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    accent,
    initialCart,
    initialSaved,
    initialWishlist,
    route,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  if (accent) window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  if (initialCart) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(initialCart));
  if (initialSaved) window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(initialSaved));
  if (initialWishlist)
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(initialWishlist));

  function Providers({ children }: { children: ReactNode }) {
    const tree = (
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    );
    return route !== undefined ? <MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter> : tree;
  }

  return render(ui, { wrapper: Providers, ...renderOptions });
}
