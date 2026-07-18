/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { CartProvider } from '../../src/cart/CartContext';
import type { AccentKey } from '../../src/theme/accents';
import type { CartLine } from '../../src/cart/CartContext';

const ACCENT_STORAGE_KEY = 'apex_accent';
const CART_STORAGE_KEY = 'apex_cart';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Pre-seeds localStorage so ThemeProvider hydrates with this accent. */
  accent?: AccentKey;
  /** Pre-seeds localStorage so CartProvider hydrates with these lines. */
  initialCart?: CartLine[];
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { accent, initialCart, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  if (accent) window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  if (initialCart) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(initialCart));

  return render(ui, { wrapper: Providers, ...renderOptions });
}
