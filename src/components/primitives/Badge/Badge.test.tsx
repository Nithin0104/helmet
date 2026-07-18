import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label text', () => {
    render(<Badge label="Bestseller" />);
    expect(screen.getByText('Bestseller')).toBeInTheDocument();
  });

  it('renders children over label when both are given', () => {
    render(<Badge label="ignored">Children win</Badge>);
    expect(screen.getByText('Children win')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('dot variant renders without requiring a label', () => {
    const { container } = render(<Badge variant="dot" />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Badge label="Bestseller" tone="success" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
