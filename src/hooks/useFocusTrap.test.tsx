import { describe, expect, it, vi } from 'vitest';
import { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from './useFocusTrap';

function Trap({ onEscape }: { onEscape?: () => void }) {
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active, { onEscape });
  return (
    <div>
      <button>outside</button>
      {active && (
        <div ref={ref} role="dialog">
          <button>first</button>
          <button>last</button>
        </div>
      )}
      <button onClick={() => setActive(false)}>deactivate</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus into the container when activated', () => {
    render(<Trap />);
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('calls onEscape when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<Trap onEscape={onEscape} />);

    await user.keyboard('{Escape}');

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('wraps focus from the last element back to the first on Tab', async () => {
    const user = userEvent.setup();
    render(<Trap />);

    screen.getByRole('button', { name: 'last' }).focus();
    await user.tab();

    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps focus from the first element to the last on Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<Trap />);

    screen.getByRole('button', { name: 'first' }).focus();
    await user.tab({ shift: true });

    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('restores focus to the previously focused element on deactivate', async () => {
    const user = userEvent.setup();
    render(<Trap />);
    const deactivate = screen.getByRole('button', { name: 'deactivate' });

    // Focus the trigger, then deactivate — focus should return to it.
    deactivate.focus();
    await user.click(deactivate);

    expect(deactivate).toHaveFocus();
  });
});
