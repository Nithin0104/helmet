import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false}>Body</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a labelled dialog when open, via a portal to document.body', () => {
    render(<Modal open title="Confirm" onClose={() => {}}>Body content</Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Confirm' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest('body')).toBe(document.body);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('Escape calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open title="Confirm" onClose={onClose}>Body</Modal>);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('clicking the scrim calls onClose when closeOnScrim is true (default)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open title="Confirm" onClose={onClose}>Body</Modal>);

    // eslint-disable-next-line testing-library/no-node-access
    const scrim = screen.getByRole('dialog').parentElement!;
    await user.click(scrim);

    expect(onClose).toHaveBeenCalled();
  });

  it('clicking inside the modal body does not call onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open title="Confirm" onClose={onClose}>Body</Modal>);

    await user.click(screen.getByText('Body'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on scrim click when closeOnScrim is false', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open title="Confirm" onClose={onClose} closeOnScrim={false}>
        Body
      </Modal>,
    );

    const scrim = screen.getByRole('dialog').parentElement!;
    await user.click(scrim);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('the close button calls onClose and can be hidden via showClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open title="Confirm" onClose={onClose}>
        Body
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal open title="Confirm" onClose={onClose} showClose={false}>
        Body
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations while open', async () => {
    render(<Modal open title="Confirm" onClose={() => {}}>Body</Modal>);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
