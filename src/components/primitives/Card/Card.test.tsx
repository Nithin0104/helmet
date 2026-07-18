import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Card } from './Card';

describe('Card', () => {
  it('renders title, brand, and a formatted INR price', () => {
    render(<Card title="Velocity RS Carbon" brand="Apexline" price={42999} />);
    expect(screen.getByRole('heading', { name: 'Velocity RS Carbon' })).toBeInTheDocument();
    expect(screen.getByText('Apexline')).toBeInTheDocument();
    expect(screen.getByText('₹42,999')).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    render(<Card title="Velocity RS Carbon" href="/product/velocity-rs-carbon" />);
    expect(screen.getByRole('link', { name: /velocity rs carbon/i })).toHaveAttribute(
      'href',
      '/product/velocity-rs-carbon',
    );
  });

  it('renders as a clickable article when onClick is provided without href', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card title="Velocity RS Carbon" onClick={onClick} />);

    await user.click(screen.getByText('Velocity RS Carbon'));

    expect(onClick).toHaveBeenCalled();
  });

  it('renders an empty-state placeholder tile when no media or image is given (product variant)', () => {
    const { container } = render(<Card title="Velocity RS Carbon" variant="product" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('renders a real (decorative) image when image is provided', () => {
    const { container } = render(<Card title="Velocity RS Carbon" image="/velocity.jpg" />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/velocity.jpg');
    expect(img).toHaveAttribute('alt', '');
  });

  it('omits the media block entirely for a feature-variant card with no media', () => {
    const { container } = render(<Card title="Certified Protection" variant="feature" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Card title="Velocity RS Carbon" brand="Apexline" price={42999} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
