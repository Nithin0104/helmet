import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders nothing when open is false', () => {
    render(<Toast message="Added to cart" open={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the message as a polite status region by default', () => {
    render(<Toast message="Added to cart" />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Added to cart');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('the dismiss button calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast message="Added to cart" onDismiss={onDismiss} duration={0} />);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('omits the dismiss button when onDismiss is not provided', () => {
    render(<Toast message="Added to cart" duration={0} />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('renders an action button and fires its onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Toast message="Added to cart" duration={0} action={{ label: 'View cart', onClick }} />);

    await user.click(screen.getByRole('button', { name: 'View cart' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration elapses', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Added to cart" onDismiss={onDismiss} duration={3000} />);

    vi.advanceTimersByTime(3000);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Added to cart" onDismiss={onDismiss} duration={0} />);

    vi.advanceTimersByTime(10000);

    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Toast message="Added to cart" duration={0} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
