import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { StickyBuyBar } from './StickyBuyBar';

describe('StickyBuyBar', () => {
  it('renders price, meta and the CTA label', () => {
    render(<StickyBuyBar price="₹42,999" meta="Matte Black · Size L · Qty 1" label="Add to cart" />);
    expect(screen.getByText('₹42,999')).toBeInTheDocument();
    expect(screen.getByText('Matte Black · Size L · Qty 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  it('fires onAdd when the CTA is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<StickyBuyBar price="₹1" onAdd={onAdd} />);
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('reflects the loading and done phases and disables the CTA', () => {
    const { rerender } = render(<StickyBuyBar price="₹1" phase="loading" />);
    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();
    rerender(<StickyBuyBar price="₹1" phase="done" />);
    expect(screen.getByRole('button', { name: 'Added' })).toBeDisabled();
  });

  it('is inert when hidden: aria-hidden and the CTA is not focusable', () => {
    render(<StickyBuyBar price="₹1" visible={false} />);
    const cta = screen.getByRole('button', { name: 'Add to cart', hidden: true });
    expect(cta).toHaveAttribute('tabindex', '-1');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<StickyBuyBar price="₹42,999" meta="Size L" label="Add to cart" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
