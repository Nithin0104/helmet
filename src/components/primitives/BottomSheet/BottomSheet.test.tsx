import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(<BottomSheet open={false}>Body</BottomSheet>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a dialog portalled to document.body when open', () => {
    render(
      <BottomSheet open title="Filters" onClose={() => {}}>
        Body content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest('body')).toBe(document.body);
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('clicking the scrim calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <BottomSheet open title="Filters" onClose={onClose}>
        Body
      </BottomSheet>,
    );

    const scrim = screen.getByRole('dialog').parentElement!;
    await user.click(scrim);

    expect(onClose).toHaveBeenCalled();
  });

  it('clicking inside the sheet does not call onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <BottomSheet open title="Filters" onClose={onClose}>
        Body
      </BottomSheet>,
    );

    await user.click(screen.getByText('Body'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('the close button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <BottomSheet open title="Filters" onClose={onClose}>
        Body
      </BottomSheet>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders without a header when title is omitted', () => {
    render(<BottomSheet open onClose={() => {}}>Body</BottomSheet>);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('respects showHandle', () => {
    const { rerender } = render(
      <BottomSheet open onClose={() => {}} showHandle>
        Body
      </BottomSheet>,
    );
    expect(document.body.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);

    rerender(
      <BottomSheet open onClose={() => {}} showHandle={false}>
        Body
      </BottomSheet>,
    );
    expect(document.body.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });

  it('has no detectable accessibility violations while open', async () => {
    render(
      <BottomSheet open title="Filters" onClose={() => {}}>
        Body
      </BottomSheet>,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
