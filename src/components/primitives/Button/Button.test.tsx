import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';

describe('Button', () => {
  it('renders a native button by default with its label as accessible name', () => {
    render(<Button label="Shop now" />);
    expect(screen.getByRole('button', { name: 'Shop now' })).toBeInTheDocument();
  });

  it('fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label="Shop now" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Shop now' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as an anchor when as="a", with href', () => {
    render(
      <Button as="a" href="/shop" label="Shop now" />,
    );
    const link = screen.getByRole('link', { name: 'Shop now' });
    expect(link).toHaveAttribute('href', '/shop');
  });

  it('disables the button and marks it aria-busy while loading', () => {
    render(<Button label="Shop now" loading />);
    const btn = screen.getByRole('button', { name: 'Shop now' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('disabled prevents onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label="Shop now" disabled onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Shop now' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('children take precedence over label', () => {
    render(<Button label="ignored">Custom content</Button>);
    expect(screen.getByRole('button', { name: 'Custom content' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Button label="Shop now" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
