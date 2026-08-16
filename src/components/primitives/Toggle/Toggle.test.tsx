import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders as a switch, off by default', () => {
    render(<Toggle label="Notifications" />);
    const el = screen.getByRole('switch', { name: 'Notifications' });
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('is keyboard operable: Tab focuses it and Enter/Space toggles it (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Toggle label="Notifications" />);
    const el = screen.getByRole('switch', { name: 'Notifications' });

    await user.tab();
    expect(el).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(el).toHaveAttribute('aria-checked', 'true');

    await user.keyboard(' ');
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('is controlled when checked is provided: click reports via onChange without flipping itself', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Notifications" checked={false} onChange={onChange} />);
    const el = screen.getByRole('switch', { name: 'Notifications' });

    await user.click(el);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('does not toggle or call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Notifications" disabled onChange={onChange} />);
    const el = screen.getByRole('switch', { name: 'Notifications' });

    await user.click(el);

    expect(onChange).not.toHaveBeenCalled();
    expect(el).toBeDisabled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Toggle label="Notifications" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
