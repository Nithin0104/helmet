import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveButton } from './SaveButton';

describe('SaveButton', () => {
  it('renders an accessible "Save" label and unpressed state when not saved', () => {
    render(<SaveButton saved={false} onToggle={() => {}} label="Velocity RS Carbon" />);
    const btn = screen.getByRole('button', { name: 'Save Velocity RS Carbon' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a "Remove" label and pressed state when saved', () => {
    render(<SaveButton saved onToggle={() => {}} label="Velocity RS Carbon" />);
    const btn = screen.getByRole('button', {
      name: 'Remove Velocity RS Carbon from your wishlist',
    });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle with the next state when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SaveButton saved={false} onToggle={onToggle} label="Urban GT" />);

    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('toggles the other way when already saved', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SaveButton saved onToggle={onToggle} label="Urban GT" />);

    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('does not call onToggle when disabled', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SaveButton saved={false} onToggle={onToggle} label="Urban GT" disabled />);

    await user.click(screen.getByRole('button'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <SaveButton saved={false} onToggle={() => {}} label="Velocity RS Carbon" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
