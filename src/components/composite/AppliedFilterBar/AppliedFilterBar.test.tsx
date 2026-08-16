import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { AppliedFilterBar } from './AppliedFilterBar';

const CHIPS = [
  { group: 'Brand', label: 'APEX' },
  { group: 'Type', label: 'Track' },
  { group: 'Price', label: '≤ £600' },
];

describe('AppliedFilterBar', () => {
  it('renders a labelled region with a chip per filter and the count', () => {
    render(<AppliedFilterBar chips={CHIPS} countLabel="Showing 1–9 of 24" />);
    expect(screen.getByRole('region', { name: 'Applied filters' })).toBeInTheDocument();
    expect(screen.getByText('Showing 1–9 of 24')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove APEX' })).toBeInTheDocument();
  });

  it('removes a chip and calls onRemove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<AppliedFilterBar chips={CHIPS} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove Track' }));

    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ label: 'Track' }));
    expect(screen.queryByRole('button', { name: 'Remove Track' })).not.toBeInTheDocument();
  });

  it('clears all chips and calls onClearAll, then shows the empty label', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(<AppliedFilterBar chips={CHIPS} onClearAll={onClearAll} emptyLabel="No filters applied" />);

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(onClearAll).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  });

  it('prefixes the group when showGroups is set', () => {
    render(<AppliedFilterBar chips={CHIPS} showGroups />);
    expect(screen.getByRole('button', { name: 'Remove Brand APEX' })).toBeInTheDocument();
  });

  it('accepts plain string chips', () => {
    render(<AppliedFilterBar chips={['Sale', 'New in']} />);
    expect(screen.getByRole('button', { name: 'Remove Sale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove New in' })).toBeInTheDocument();
  });

  it('re-shows a chip that a controlled parent removes then re-adds', async () => {
    const user = userEvent.setup();
    const brand = { group: 'Brand', label: 'APEX', value: 'brand:APEX' };
    const { rerender } = render(<AppliedFilterBar chips={[brand]} />);

    // Self-hide on remove.
    await user.click(screen.getByRole('button', { name: 'Remove APEX' }));
    expect(screen.queryByRole('button', { name: 'Remove APEX' })).not.toBeInTheDocument();

    // Controlled parent drops the chip from its state…
    rerender(<AppliedFilterBar chips={[]} />);
    // …then the same filter is re-applied — the chip must reappear.
    rerender(<AppliedFilterBar chips={[brand]} />);
    expect(screen.getByRole('button', { name: 'Remove APEX' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<AppliedFilterBar chips={CHIPS} showGroups />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
