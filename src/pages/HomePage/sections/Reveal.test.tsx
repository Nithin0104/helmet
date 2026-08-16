import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { render, screen } from '@testing-library/react';
import { Reveal } from './Reveal';

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <p>Section body</p>
      </Reveal>,
    );
    expect(screen.getByText('Section body')).toBeInTheDocument();
  });

  it('applies the reveal class plus any extra className', () => {
    const { container } = render(
      <Reveal className="extra">
        <span>x</span>
      </Reveal>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toMatch(/reveal/);
    expect(wrapper.className).toMatch(/extra/);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <Reveal>
        <p>hi</p>
      </Reveal>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
