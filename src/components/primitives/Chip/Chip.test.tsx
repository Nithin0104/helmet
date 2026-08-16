import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders its label and reports aria-pressed for select/filter variants', () => {
    render(<Chip label="Full-face" />);
    expect(screen.getByRole('button', { name: 'Full-face' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('nav variant does not expose aria-pressed', () => {
    render(<Chip label="Home" variant="nav" />);
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-pressed');
  });

  it('click calls onToggle with the flipped selected state', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Chip label="Full-face" selected={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Full-face' }));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('renders a count badge when provided', () => {
    render(<Chip label="Full-face" count={12} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('removable renders a remove control that stops propagation and calls onRemove', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    render(<Chip label="Full-face" removable onToggle={onToggle} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('disabled prevents onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Chip label="Full-face" disabled onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Full-face' }));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Chip label="Full-face" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
