import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AnnounceBanner } from './AnnounceBanner';

describe('AnnounceBanner', () => {
  it('renders each promo message', () => {
    render(<AnnounceBanner messages={['FREE SHIPPING', 'EXPERT SUPPORT']} />);
    // Marquee duplicates the track for a seamless loop, so each appears twice.
    expect(screen.getAllByText('FREE SHIPPING').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('EXPERT SUPPORT').length).toBeGreaterThanOrEqual(1);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<AnnounceBanner messages={['FREE SHIPPING']} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
