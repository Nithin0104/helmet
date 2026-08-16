import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { UndoToast } from './UndoToast';

describe('UndoToast', () => {
  it('renders nothing when closed', () => {
    render(<UndoToast open={false} message="Removed item" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the message and a default UNDO action when open', () => {
    render(<UndoToast open message="Removed Velocity RS Carbon" />);
    expect(screen.getByRole('status')).toHaveTextContent('Removed Velocity RS Carbon');
    expect(screen.getByRole('button', { name: 'UNDO' })).toBeInTheDocument();
  });

  it('fires onAction when the action is clicked', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<UndoToast open message="Removed item" actionLabel="RESTORE" onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'RESTORE' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<UndoToast open message="Removed item" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
