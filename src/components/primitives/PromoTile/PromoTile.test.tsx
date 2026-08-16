import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PromoTile } from './PromoTile';

describe('PromoTile', () => {
  it('renders kicker, headline and sub', () => {
    render(<PromoTile kicker="SHOWROOM EXCLUSIVE" headline="Trade in your old lid" sub="Get 15% off." />);
    expect(screen.getByText('SHOWROOM EXCLUSIVE')).toBeInTheDocument();
    expect(screen.getByText('Trade in your old lid')).toBeInTheDocument();
    expect(screen.getByText('Get 15% off.')).toBeInTheDocument();
  });

  it('renders the CTA as a link when ctaHref is set', () => {
    render(<PromoTile headline="Book a fitting" ctaLabel="Book" ctaHref="/fitting" />);
    const link = screen.getByRole('link', { name: /Book/ });
    expect(link).toHaveAttribute('href', '/fitting');
  });

  it('renders the CTA as a button and fires onCtaClick when no href', async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();
    render(<PromoTile headline="Book a fitting" ctaLabel="Book" onCtaClick={onCtaClick} />);

    await user.click(screen.getByRole('button', { name: /Book/ }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('omits the CTA when no ctaLabel is given', () => {
    render(<PromoTile headline="Just a headline" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('prefers children over the sub prop', () => {
    render(
      <PromoTile headline="Promo" sub="ignored">
        <span>rich sub</span>
      </PromoTile>,
    );
    expect(screen.getByText('rich sub')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <PromoTile kicker="SALE" headline="15% off track helmets" sub="This week only." ctaLabel="Shop" ctaHref="/shop" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
