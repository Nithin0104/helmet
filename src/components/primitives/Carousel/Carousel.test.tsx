import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Carousel } from './Carousel';

const slides = ['Slide one', 'Slide two', 'Slide three'];

describe('Carousel', () => {
  it('renders nothing when there are no slides', () => {
    const { container } = render(<Carousel items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all slides, only the current one not aria-hidden', () => {
    render(<Carousel items={slides} />);
    expect(screen.getByText('Slide one').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Slide two').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('Next advances the slide (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Carousel items={slides} />);

    await user.click(screen.getByRole('button', { name: 'Next slide' }));

    expect(screen.getByText('Slide two').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });

  it('loops from the last slide back to the first when loop is true (default, uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Carousel items={slides} />);
    const next = screen.getByRole('button', { name: 'Next slide' });

    await user.click(next);
    await user.click(next);
    await user.click(next);

    expect(screen.getByText('Slide one').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });

  it('does not loop past the last slide when loop is false', async () => {
    const user = userEvent.setup();
    render(<Carousel items={slides} loop={false} />);
    const next = screen.getByRole('button', { name: 'Next slide' });

    await user.click(next);
    await user.click(next);

    expect(next).toBeDisabled();
  });

  it('is controlled when index is provided: click reports via onChange without moving itself', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Carousel items={slides} index={0} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Next slide' }));

    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('Slide one').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });

  it('dots navigate directly to a slide', async () => {
    const user = userEvent.setup();
    render(<Carousel items={slides} />);

    await user.click(screen.getByRole('button', { name: 'Go to slide 3' }));

    expect(screen.getByText('Slide three').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });

  it('hides arrows and dots for a single slide', () => {
    render(<Carousel items={['Only slide']} />);
    expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to slide 1' })).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Carousel items={slides} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
