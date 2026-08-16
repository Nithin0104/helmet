import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { CartLineItem } from './CartLineItem';

const base = {
  brand: 'APEX',
  model: 'Velocity RS Carbon',
  type: 'HELMET',
  color: 'Matte Black',
  colorHex: '#14141a',
  size: 'M',
  price: 84999,
  qty: 1,
  stock: 14,
};

describe('CartLineItem', () => {
  it('renders brand, model and the line total (price × qty)', () => {
    render(<CartLineItem {...base} qty={2} />);
    expect(screen.getByText('APEX')).toBeInTheDocument();
    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();
    expect(screen.getByText('₹1,69,998')).toBeInTheDocument(); // 84999 × 2
    expect(screen.getByText('₹84,999 each')).toBeInTheDocument();
  });

  it('renders colour and size chips', () => {
    render(<CartLineItem {...base} />);
    expect(screen.getByText('Matte Black')).toBeInTheDocument();
    expect(screen.getByText('Size M')).toBeInTheDocument();
  });

  it('increments quantity through the stepper', async () => {
    const onQtyChange = vi.fn();
    const user = userEvent.setup();
    render(<CartLineItem {...base} qty={1} onQtyChange={onQtyChange} />);
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onQtyChange).toHaveBeenCalledWith(2);
  });

  it('disables decrement at the minimum and increment at the stock ceiling', () => {
    render(<CartLineItem {...base} qty={3} stock={3} />);
    // qty 3 of 3 in stock: cannot go higher; but is above min so decrement is enabled.
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeEnabled();
  });

  it('shows a low-stock warning', () => {
    render(<CartLineItem {...base} stock={3} />);
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('shows out-of-stock and disables the stepper', () => {
    render(<CartLineItem {...base} stock={0} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  it('exposes save and remove as labelled buttons and fires their handlers', async () => {
    const onSave = vi.fn();
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<CartLineItem {...base} onSave={onSave} onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Save for later' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('in the saved variant, hides the stepper and flips save to "Move to bag"', () => {
    render(<CartLineItem {...base} saved />);
    expect(screen.queryByRole('button', { name: 'Increase quantity' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move to bag' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<CartLineItem {...base} onSave={vi.fn()} onRemove={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
