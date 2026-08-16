import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { useScrollToTop } from './useScrollToTop';

function Harness() {
  useScrollToTop();
  const navigate = useNavigate();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <span>home</span>
            <button onClick={() => navigate('/shop')}>to shop</button>
            <button onClick={() => navigate('/#reviews')}>to hash</button>
          </div>
        }
      />
      <Route path="/shop" element={<span>shop</span>} />
    </Routes>
  );
}

let scrollSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollSpy = vi.fn();
  window.scrollTo = scrollSpy as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useScrollToTop', () => {
  it('scrolls to the top on the initial render', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>,
    );
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 0, left: 0 }));
  });

  it('scrolls to the top when the pathname changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>,
    );
    scrollSpy.mockClear();

    await user.click(screen.getByText('to shop'));

    expect(screen.getByText('shop')).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('does not scroll when only the hash changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>,
    );
    scrollSpy.mockClear();

    await user.click(screen.getByText('to hash'));

    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
