import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Tabs } from './Tabs';
import type { TabItem } from './Tabs';

const items: TabItem[] = [
  { id: 'overview', label: 'Overview', content: 'Overview content' },
  { id: 'specs', label: 'Specs', content: 'Specs content' },
  { id: 'reviews', label: 'Reviews', content: 'Reviews content', disabled: true },
];

describe('Tabs', () => {
  it('renders a tablist with the first item selected by default (uncontrolled)', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');
  });

  it('switches panels on click', async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);

    await user.click(screen.getByRole('tab', { name: 'Specs' }));

    expect(screen.getByRole('tab', { name: 'Specs' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Specs content');
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} value="overview" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: 'Specs' }));

    expect(onChange).toHaveBeenCalledWith('specs');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled tabs cannot be selected', async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);

    const reviewsTab = screen.getByRole('tab', { name: 'Reviews' });
    expect(reviewsTab).toBeDisabled();

    await user.click(reviewsTab);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('links each tab to its panel via aria-controls/aria-labelledby', () => {
    render(<Tabs items={items} />);
    const tab = screen.getByRole('tab', { name: 'Overview' });
    const panel = screen.getByRole('tabpanel');
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Tabs items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
