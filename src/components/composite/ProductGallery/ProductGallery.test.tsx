import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ProductGallery } from './ProductGallery';

const VIEWS = ['Front', 'Side', 'Back'];

describe('ProductGallery', () => {
  it('renders a labelled image group with prev/next controls and a counter', () => {
    render(<ProductGallery views={VIEWS} />);
    expect(screen.getByRole('group', { name: 'Product images' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next view' })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('disables Previous on the first frame and advances with Next', async () => {
    const user = userEvent.setup();
    render(<ProductGallery views={VIEWS} />);
    expect(screen.getByRole('button', { name: 'Previous view' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next view' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('disables Next on the last frame', async () => {
    const user = userEvent.setup();
    render(<ProductGallery views={VIEWS} defaultValue={2} />);
    expect(screen.getByRole('button', { name: 'Next view' })).toBeDisabled();
    void user;
  });

  it('jumps to a frame via the thumbnail controls', async () => {
    const user = userEvent.setup();
    render(<ProductGallery views={VIEWS} />);
    await user.click(screen.getByRole('button', { name: 'View 3: Back' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('jumps to a frame via the dot controls', async () => {
    const user = userEvent.setup();
    render(<ProductGallery views={VIEWS} />);
    await user.click(screen.getByRole('button', { name: 'Go to view 2: Side' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<ProductGallery views={VIEWS} />);
    screen.getByRole('button', { name: 'Next view' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProductGallery views={VIEWS} value={0} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Next view' }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('accepts a comma-separated views string', () => {
    render(<ProductGallery views="Front, Side" />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('opens a fullscreen lightbox when enabled', async () => {
    const user = userEvent.setup();
    render(<ProductGallery views={VIEWS} lightbox />);
    await user.click(screen.getByRole('button', { name: /Expand image/ }));
    expect(screen.getByRole('dialog', { name: 'Product image' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ProductGallery views={VIEWS} badge="NEW" safety="SHARP 5★" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
