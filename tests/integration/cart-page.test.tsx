import { describe, expect, it } from 'vitest';
import CartPage from '../../src/pages/CartPage';
import type { CartLine } from '../../src/cart/CartContext';
import { renderWithProviders, screen, userEvent, within } from '../utils';

/**
 * Real catalog fixture so `toDisplayLine` can enrich the line (colour hex,
 * size label, stock, type). `velocity-rs-carbon` carries a `Matte Black`
 * colourway and an `m` size with plenty of stock (14 units) — comfortably
 * above the "Only N left" low-stock threshold.
 */
const LINE: CartLine = {
  id: 'velocity-rs-carbon|Matte Black|m',
  productId: 'velocity-rs-carbon',
  name: 'Velocity RS Carbon',
  brand: 'MT Helmets',
  price: 42999,
  color: 'Matte Black',
  size: 'm',
  qty: 1,
};

describe('CartPage integration', () => {
  it('renders the bag title and each seeded line', () => {
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    expect(screen.getByRole('heading', { name: 'Your bag' })).toBeInTheDocument();
    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();
  });

  it('shows the empty state with a Shop helmets action when the cart is empty', () => {
    renderWithProviders(<CartPage />, { route: '/cart' });

    expect(screen.getByText('Your bag is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shop helmets' })).toBeInTheDocument();
  });

  it('increasing quantity updates the order-summary subtotal row', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    const subtotalRow = screen.getByText('Subtotal').closest('div') as HTMLElement;
    expect(within(subtotalRow).getByText('₹42,999')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(within(subtotalRow).getByText('₹85,998')).toBeInTheDocument();
  });

  it('removing a line shows an undo toast that restores it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.queryByText('Velocity RS Carbon')).not.toBeInTheDocument();
    // Removing the only line also flips the bag into its empty state, which is
    // itself a `role="status"` region, so target the undo toast by its message.
    expect(screen.getByText('Removed Velocity RS Carbon')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'UNDO' }));

    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();
  });

  it('applying promo code RIDE10 adds a discount row', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    await user.click(screen.getByRole('button', { name: /Have a promo code\?/ }));
    await user.type(screen.getByLabelText('Promo code'), 'RIDE10');
    await user.click(screen.getByRole('button', { name: 'APPLY' }));

    expect(screen.getByText('Discount · RIDE10')).toBeInTheDocument();
  });

  it('save for later moves a line into the saved section and out of the bag', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    await user.click(screen.getByRole('button', { name: 'Save for later' }));

    expect(screen.getByText(/SAVED FOR LATER/)).toBeInTheDocument();
    // The line no longer renders inside the bag's qty stepper (saved rows hide it).
    expect(screen.queryByRole('button', { name: 'Increase quantity' })).not.toBeInTheDocument();
    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move to bag' })).toBeInTheDocument();
  });

  it('CLEAR ALL asks for confirmation, then clearing shows an undo toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    await user.click(screen.getByRole('button', { name: 'CLEAR ALL' }));
    expect(screen.getByText('Sure?')).toBeInTheDocument();

    // Backing out of the confirmation leaves the line untouched.
    await user.click(screen.getByRole('button', { name: 'NO' }));
    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'CLEAR ALL' }));
    await user.click(screen.getByRole('button', { name: 'YES' }));

    expect(screen.getByText('Your bag is empty')).toBeInTheDocument();
    expect(screen.getByText('Bag cleared')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'UNDO' }));
    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();
  });

  it('clicking checkout disables the button and shows a processing state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    const checkoutBtn = screen.getByRole('button', { name: /^Checkout ·/ });
    await user.click(checkoutBtn);

    // Both the sticky summary CTA and the mobile checkout bar flip to
    // "Processing" while the (debounced) navigation to /checkout is pending.
    const processingBtns = screen.getAllByRole('button', { name: 'Processing' });
    expect(processingBtns.length).toBeGreaterThan(0);
    processingBtns.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('quick-adding a suggested item adds it to the bag', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart', initialCart: [LINE] });

    await user.click(screen.getByRole('button', { name: 'Add Pro Race Gloves to bag' }));

    expect(screen.getByText('2 items')).toBeInTheDocument();
  });
});
