import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ActionButton } from './ActionButton';

describe('ActionButton', () => {
  it('renders the idle label for its variant by default', () => {
    render(<ActionButton />);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  it('submit variant defaults to "Submit"', () => {
    render(<ActionButton variant="submit" />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('uncontrolled: click runs onClick, shows loading, then done, then returns to idle', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime });
    let resolveClick: () => void;
    const onClick = vi.fn(() => new Promise<void>((resolve) => (resolveClick = resolve)));

    render(<ActionButton onClick={onClick} doneDuration={50} />);
    const btn = screen.getByRole('button');

    await user.click(btn);
    expect(screen.getByRole('button', { name: /adding/i })).toBeInTheDocument();

    resolveClick!();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Added' })).toBeInTheDocument());

    vi.advanceTimersByTime(50);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument());

    vi.useRealTimers();
  });

  it('is controlled when state is provided: click still calls onClick but the label does not change itself', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionButton state="idle" onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  it('ignores clicks while already loading (controlled)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionButton state="loading" onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled prevents onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionButton disabled onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ActionButton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
