import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoverZoom } from './HoverZoom';

describe('HoverZoom', () => {
  it('renders an image when src is provided', () => {
    render(<HoverZoom src="/helmet.jpg" alt="Velocity RS Carbon" />);
    expect(screen.getByRole('img', { name: 'Velocity RS Carbon' })).toHaveAttribute('src', '/helmet.jpg');
  });

  it('renders a placeholder tile when neither src nor media is given', () => {
    const { container } = render(<HoverZoom />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
  });

  it('renders custom media content over src', () => {
    render(<HoverZoom src="/ignored.jpg" media={<video data-testid="custom-media" />} />);
    expect(screen.getByTestId('custom-media')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('overlayContent only renders in overlay mode', () => {
    const { rerender } = render(
      <HoverZoom src="/helmet.jpg" mode="overlay" overlayContent={<span>Zoom in</span>} />,
    );
    expect(screen.getByText('Zoom in')).toBeInTheDocument();

    rerender(<HoverZoom src="/helmet.jpg" mode="always" overlayContent={<span>Zoom in</span>} />);
    expect(screen.queryByText('Zoom in')).not.toBeInTheDocument();
  });
});
