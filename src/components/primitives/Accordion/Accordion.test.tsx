import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';

const items: AccordionItem[] = [
  { id: 'q1', q: 'What is your return policy?', a: 'Returns within 15 days.' },
  { id: 'q2', q: 'Is it certified?', a: 'ISI and ECE 22.06 certified.' },
  { id: 'q3', q: 'What sizes are available?', a: 'XS through XXL.' },
];

describe('Accordion', () => {
  it('renders every item collapsed by default', () => {
    render(<Accordion items={items} />);
    for (const item of items) {
      expect(screen.getByRole('button', { name: item.q as string })).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('expands an item on click and exposes it via aria-expanded', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByRole('button', { name: items[0].q as string }));

    expect(screen.getByRole('button', { name: items[0].q as string })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Returns within 15 days.')).toBeInTheDocument();
  });

  it('is keyboard operable via Tab + Enter', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: items[0].q as string })).toHaveAttribute('aria-expanded', 'true');
  });

  it('single mode: opening a new item closes the previously open one', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} mode="single" />);

    await user.click(screen.getByRole('button', { name: items[0].q as string }));
    await user.click(screen.getByRole('button', { name: items[1].q as string }));

    expect(screen.getByRole('button', { name: items[0].q as string })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: items[1].q as string })).toHaveAttribute('aria-expanded', 'true');
  });

  it('multi mode: multiple items can be open at once', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} mode="multi" />);

    await user.click(screen.getByRole('button', { name: items[0].q as string }));
    await user.click(screen.getByRole('button', { name: items[1].q as string }));

    expect(screen.getByRole('button', { name: items[0].q as string })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: items[1].q as string })).toHaveAttribute('aria-expanded', 'true');
  });

  it('respects defaultOpen', () => {
    render(<Accordion items={items} defaultOpen={['q2']} />);
    expect(screen.getByRole('button', { name: items[1].q as string })).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders an empty accordion with no items and no crash', () => {
    render(<Accordion items={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Accordion items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
