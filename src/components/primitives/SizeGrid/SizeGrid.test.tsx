import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SizeGrid, type SizeGridItem } from './SizeGrid';

const ITEMS: SizeGridItem[] = [
  { label: 'S', stock: 8 },
  { label: 'M', stock: 14 },
  { label: 'L', stock: 2 },
  { label: 'XL', stock: 0 },
];

describe('SizeGrid', () => {
  it('renders a radiogroup with a radio per size', () => {
    render(<SizeGrid items={ITEMS} label="Size" />);
    expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('shows a low-stock note for sizes with 3 or fewer left', () => {
    render(<SizeGrid items={ITEMS} />);
    expect(screen.getByText('Only 2 left')).toBeInTheDocument();
  });

  it('marks sold-out sizes and does not select them', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SizeGrid items={ITEMS} value={1} onChange={onChange} />);

    const xl = screen.getByRole('radio', { name: /XL/ });
    expect(xl).toHaveAttribute('aria-disabled', 'true');

    await user.click(xl);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is uncontrolled by default and defaults selection to the first in-stock size', () => {
    render(<SizeGrid items={[{ label: 'S', stock: 0 }, { label: 'M', stock: 5 }]} />);
    expect(screen.getByRole('radio', { name: 'M' })).toHaveAttribute('aria-checked', 'true');
  });

  it('selects on click when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<SizeGrid items={ITEMS} />);
    await user.click(screen.getByRole('radio', { name: 'L — Only 2 left' }));
    expect(screen.getByRole('radio', { name: 'L — Only 2 left' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SizeGrid items={ITEMS} value={0} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'M' }));
    expect(onChange).toHaveBeenCalledWith(1);
    // Still shows index 0 selected until the parent updates value.
    expect(screen.getByRole('radio', { name: 'S' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves selection with arrow keys, skipping sold-out sizes', async () => {
    const user = userEvent.setup();
    render(<SizeGrid items={ITEMS} />);
    const s = screen.getByRole('radio', { name: 'S' });
    s.focus();
    await user.keyboard('{ArrowRight}'); // → M
    await user.keyboard('{ArrowRight}'); // → L
    await user.keyboard('{ArrowRight}'); // XL sold out → wraps back to S
    expect(screen.getByRole('radio', { name: 'S' })).toHaveAttribute('aria-checked', 'true');
  });

  it('renders a size-guide trigger that fires onGuide', async () => {
    const user = userEvent.setup();
    const onGuide = vi.fn();
    render(<SizeGrid items={ITEMS} onGuide={onGuide} guideLabel="Size guide" />);
    await user.click(screen.getByRole('button', { name: 'Size guide' }));
    expect(onGuide).toHaveBeenCalled();
  });

  it('falls back to boolean availability when no stock count is given', () => {
    render(<SizeGrid items={[{ label: 'M', available: true }, { label: 'L', available: false }]} />);
    expect(screen.getByRole('radio', { name: 'L — Sold out' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'M' })).not.toHaveAttribute('aria-disabled');
  });

  it('shows shortLabel on the tile while keeping the full label as the accessible name', () => {
    render(
      <SizeGrid
        label="Size"
        items={[
          { label: 'XS (53-54cm)', shortLabel: 'XS', stock: 3 },
          { label: 'M (57-58cm)', shortLabel: 'M', stock: 14 },
        ]}
      />,
    );
    // The tile shows the short code, never the measurement range.
    const xs = screen.getByRole('radio', { name: 'XS (53-54cm) — Only 3 left' });
    expect(xs).toHaveTextContent('XS');
    expect(xs).not.toHaveTextContent('53-54cm');
    expect(screen.queryByText(/53-54cm/)).not.toBeInTheDocument();
    // Full label is retained only as the accessible name (screen-reader detail).
    expect(xs.getAttribute('aria-label')).toBe('XS (53-54cm) — Only 3 left');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SizeGrid items={ITEMS} helper="Measure above the eyebrows" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
