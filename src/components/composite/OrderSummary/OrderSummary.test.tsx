import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { OrderSummary } from './OrderSummary';
import type { SummaryRow } from '../../../lib/cart';

const rows: SummaryRow[] = [
  { label: 'Subtotal', value: '₹1,00,000' },
  { label: 'Delivery', value: 'FREE', tone: 'good' },
  { label: 'GST (18%)', value: '₹18,000' },
];

function setup(props: Partial<React.ComponentProps<typeof OrderSummary>> = {}) {
  return render(
    <OrderSummary
      rows={rows}
      total="₹1,18,000"
      checkoutLabel="Checkout · ₹1,18,000"
      payMethods={['UPI', 'VISA']}
      trust={[{ icon: '✓', title: 'Secure checkout', sub: 'TLS' }]}
      {...props}
    />,
  );
}

describe('OrderSummary', () => {
  it('renders the money rows, total and checkout label', () => {
    setup();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('₹1,18,000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Checkout · ₹1,18,000/ })).toBeInTheDocument();
  });

  it('renders pay-method chips and trust badges', () => {
    setup();
    expect(screen.getByText('UPI')).toBeInTheDocument();
    expect(screen.getByText('Secure checkout')).toBeInTheDocument();
  });

  it('reveals the promo input from the collapsed toggle and applies an upper-cased code', async () => {
    const onApplyPromo = vi.fn();
    const user = userEvent.setup();
    setup({ onApplyPromo });

    await user.click(screen.getByRole('button', { name: /Have a promo code/ }));
    const input = screen.getByLabelText('Promo code');
    await user.type(input, 'ride10');
    await user.click(screen.getByRole('button', { name: 'APPLY' }));

    expect(onApplyPromo).toHaveBeenCalledWith('RIDE10');
  });

  it('applies the promo on Enter', async () => {
    const onApplyPromo = vi.fn();
    const user = userEvent.setup();
    setup({ onApplyPromo, promoCollapsible: false });

    await user.type(screen.getByLabelText('Promo code'), 'apex15{Enter}');
    expect(onApplyPromo).toHaveBeenCalledWith('APEX15');
  });

  it('shows a success or error promo message', () => {
    const { rerender } = setup({ promoMessage: 'Invalid code', promoOk: false });
    expect(screen.getByText('Invalid code')).toBeInTheDocument();
    rerender(
      <OrderSummary rows={rows} total="₹1" checkoutLabel="Go" promoMessage="10% off" promoOk />,
    );
    expect(screen.getByText('10% off')).toBeInTheDocument();
  });

  it('fires onCheckout and disables the button while loading', async () => {
    const onCheckout = vi.fn();
    const user = userEvent.setup();
    const { rerender } = setup({ onCheckout });
    await user.click(screen.getByRole('button', { name: /Checkout/ }));
    expect(onCheckout).toHaveBeenCalledOnce();

    rerender(
      <OrderSummary rows={rows} total="₹1" checkoutLabel="Processing" loading onCheckout={onCheckout} />,
    );
    expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();
  });

  it('has no detectable accessibility violations (promo open)', async () => {
    const { container } = setup({ promoCollapsible: false });
    expect(await axe(container)).toHaveNoViolations();
  });
});
