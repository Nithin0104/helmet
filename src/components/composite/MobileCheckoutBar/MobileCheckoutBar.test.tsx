import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { MobileCheckoutBar } from './MobileCheckoutBar';
import type { SummaryRow } from '../../../lib/cart';

const rows: SummaryRow[] = [
  { label: 'Subtotal', value: '₹1,00,000' },
  { label: 'GST (18%)', value: '₹18,000' },
];

describe('MobileCheckoutBar', () => {
  it('renders the total, CTA and a pluralised item count', () => {
    render(<MobileCheckoutBar total="₹1,18,000" itemCount={3} label="Checkout →" rows={rows} />);
    expect(screen.getByText('₹1,18,000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout →' })).toBeInTheDocument();
    expect(screen.getByText(/3 items · total/)).toBeInTheDocument();
  });

  it('uses the singular for a single item', () => {
    render(<MobileCheckoutBar total="₹1" itemCount={1} label="Checkout" rows={rows} />);
    expect(screen.getByText(/1 item · total/)).toBeInTheDocument();
  });

  it('expands the breakdown and collapses on Escape', async () => {
    const user = userEvent.setup();
    render(<MobileCheckoutBar total="₹1" itemCount={2} label="Checkout" rows={rows} />);

    const toggle = screen.getByRole('button', { name: 'Toggle order breakdown' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('₹18,000')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('disables the toggle when there is no breakdown to show', () => {
    render(<MobileCheckoutBar total="₹1" itemCount={2} label="Checkout" />);
    const toggle = screen.getByRole('button', { name: 'Toggle order breakdown' });
    expect(toggle).toBeDisabled();
    expect(toggle).not.toHaveAttribute('aria-expanded');
  });

  it('fires onCheckout and disables the CTA while loading', async () => {
    const onCheckout = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <MobileCheckoutBar total="₹1" itemCount={2} label="Checkout" onCheckout={onCheckout} />,
    );
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(onCheckout).toHaveBeenCalledOnce();

    rerender(<MobileCheckoutBar total="₹1" itemCount={2} label="Processing" loading />);
    expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <MobileCheckoutBar total="₹1,18,000" itemCount={3} label="Checkout →" rows={rows} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
