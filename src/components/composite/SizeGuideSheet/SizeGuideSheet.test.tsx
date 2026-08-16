import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SizeGuideSheet } from './SizeGuideSheet';

const ROWS = [
  ['XS', '53–54', '6¾'],
  ['S', '55–56', '7'],
  ['M', '57–58', '7¼'],
];

describe('SizeGuideSheet', () => {
  it('renders nothing when closed', () => {
    render(<SizeGuideSheet open={false} rows={ROWS} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a labelled modal dialog with the chart when open', () => {
    render(<SizeGuideSheet open rows={ROWS} title="Size guide" />);
    const dialog = screen.getByRole('dialog', { name: 'Size guide' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('XS')).toBeInTheDocument();
    expect(screen.getByText('57–58')).toBeInTheDocument();
  });

  it('closes via the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SizeGuideSheet open rows={ROWS} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SizeGuideSheet open rows={ROWS} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when the scrim is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<SizeGuideSheet open rows={ROWS} onClose={onClose} />);
    // The scrim is the aria-hidden overlay behind the panel.
    const scrim = container.parentElement?.querySelector('[aria-hidden="true"]');
    await user.click(scrim as Element);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders custom column headers', () => {
    render(<SizeGuideSheet open rows={ROWS} columns={['Size', 'Head (cm)', 'Hat']} />);
    expect(screen.getByText('Head (cm)')).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { baseElement } = render(<SizeGuideSheet open rows={ROWS} highlight="M" />);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
