import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('is not rendered until triggered', () => {
    render(
      <Tooltip content="Helpful hint">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hover trigger (default) shows the tooltip after the delay and hides on mouse leave', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful hint" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );
    const trigger = screen.getByText('Hover me');

    await user.hover(trigger);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint'));

    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('click trigger toggles the tooltip open/closed', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful hint" trigger="click">
        <button>Toggle</button>
      </Tooltip>,
    );
    const trigger = screen.getByText('Toggle');

    await user.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('focus trigger shows on focus and hides on blur', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful hint" trigger="focus" delay={0}>
        <button>Focus me</button>
      </Tooltip>,
    );

    await user.tab();
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());

    await user.tab();
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('never opens when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful hint" disabled delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByText('Hover me'));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('links the trigger to the tooltip via aria-describedby while open', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful hint" trigger="click">
        <button>Toggle</button>
      </Tooltip>,
    );
    const wrapper = screen.getByText('Toggle').parentElement!;

    await user.click(screen.getByText('Toggle'));

    const tooltip = screen.getByRole('tooltip');
    expect(wrapper.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('has no detectable accessibility violations while open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tooltip content="Helpful hint" trigger="click">
        <button>Toggle</button>
      </Tooltip>,
    );

    await user.click(screen.getByText('Toggle'));

    expect(await axe(container)).toHaveNoViolations();
  });
});
