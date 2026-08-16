import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SegmentedToggle } from './SegmentedToggle';

describe('SegmentedToggle', () => {
  it('renders a group of segments with accessible labels and marks the first active', () => {
    render(<SegmentedToggle variant="text" aria-label="Filter" />);
    expect(screen.getByRole('group', { name: 'Filter' })).toBeInTheDocument();
    const all = screen.getByRole('button', { name: 'All' });
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Sale' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects on click (uncontrolled) and reports value + index', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedToggle variant="text" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Sale' }));

    expect(onChange).toHaveBeenCalledWith('Sale', 2);
    expect(screen.getByRole('button', { name: 'Sale' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('is controlled by value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedToggle variant="text" value="All" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'New in' }));

    expect(onChange).toHaveBeenCalledWith('New in', 1);
    // still controlled to "All"
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('moves selection with arrow keys (roving)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedToggle variant="text" onChange={onChange} />);

    const all = screen.getByRole('button', { name: 'All' });
    all.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('New in', 1);

    await user.keyboard('{ArrowLeft}{ArrowLeft}'); // wraps to last
    expect(onChange).toHaveBeenLastCalledWith('Sale', 2);
  });

  it('accepts custom string items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedToggle items={['Comfy', 'Compact']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Compact' }));
    expect(onChange).toHaveBeenCalledWith('Compact', 1);
  });

  it('renders dot-grid glyph segments with their label as the accessible name', () => {
    render(<SegmentedToggle variant="grid-density" />);
    // labels come through aria-label even though the visual is a dot grid
    expect(screen.getByRole('button', { name: '2 columns' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 columns' })).toBeInTheDocument();
  });

  it('disabled blocks selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedToggle variant="text" disabled onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Sale' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SegmentedToggle variant="grid-density" aria-label="Grid density" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
