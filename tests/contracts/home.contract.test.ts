import { describe, expect, it } from 'vitest';
import {
  HERO,
  STATS,
  CATEGORIES,
  WHY_US,
  COMPARE,
  SHOWROOM,
  HOME_REVIEWS,
  STORE_RATING,
} from '../../src/data/home';

/**
 * Guards `src/data/home.ts` — the home page's CMS/API seam. Like the products /
 * accessories / navigation contracts, this asserts the shape a future backend (or
 * a content edit) must honour so the HomePage sections can't silently break.
 */

const isNonEmptyString = (v: unknown) => typeof v === 'string' && v.length > 0;
const isInternalHref = (v: unknown) => typeof v === 'string' && v.startsWith('/');

function expectCta(cta: { label: string; href: string }) {
  expect(isNonEmptyString(cta.label)).toBe(true);
  expect(isInternalHref(cta.href)).toBe(true);
}

describe('HERO', () => {
  it('has copy, a badge and two internal-linked CTAs', () => {
    expect(isNonEmptyString(HERO.badge)).toBe(true);
    expect(isNonEmptyString(HERO.headlineTop)).toBe(true);
    expect(isNonEmptyString(HERO.headlineAccent)).toBe(true);
    expect(isNonEmptyString(HERO.headlineBottom)).toBe(true);
    expect(isNonEmptyString(HERO.copy)).toBe(true);
    expectCta(HERO.primary);
    expectCta(HERO.secondary);
  });
});

describe('STATS', () => {
  it('is a non-empty list of well-typed stats', () => {
    expect(STATS.length).toBeGreaterThan(0);
    for (const stat of STATS) {
      expect(typeof stat.value).toBe('number');
      expect(isNonEmptyString(stat.label)).toBe(true);
      if (stat.decimals !== undefined) expect(stat.decimals).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('CATEGORIES', () => {
  it('is a non-empty list with kicker/title/caption and internal hrefs', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    for (const c of CATEGORIES) {
      expect(isNonEmptyString(c.kicker)).toBe(true);
      expect(isNonEmptyString(c.title)).toBe(true);
      expect(isNonEmptyString(c.caption)).toBe(true);
      expect(isInternalHref(c.href)).toBe(true);
    }
  });
});

describe('WHY_US', () => {
  it('is a non-empty list of icon/title/body cards', () => {
    expect(WHY_US.length).toBeGreaterThan(0);
    for (const w of WHY_US) {
      expect(isNonEmptyString(w.icon)).toBe(true);
      expect(isNonEmptyString(w.title)).toBe(true);
      expect(isNonEmptyString(w.body)).toBe(true);
    }
  });
});

describe('COMPARE', () => {
  it('has eyebrow/heading/copy and an internal-linked CTA', () => {
    expect(isNonEmptyString(COMPARE.eyebrow)).toBe(true);
    expect(isNonEmptyString(COMPARE.heading)).toBe(true);
    expect(isNonEmptyString(COMPARE.copy)).toBe(true);
    expectCta(COMPARE.link);
  });
});

describe('SHOWROOM', () => {
  it('has heading/copy/address/hours and two internal-linked CTAs', () => {
    expect(isNonEmptyString(SHOWROOM.eyebrow)).toBe(true);
    expect(isNonEmptyString(SHOWROOM.headingTop)).toBe(true);
    expect(isNonEmptyString(SHOWROOM.headingBottom)).toBe(true);
    expect(isNonEmptyString(SHOWROOM.copy)).toBe(true);
    expect(isNonEmptyString(SHOWROOM.address)).toBe(true);
    expect(isNonEmptyString(SHOWROOM.hours)).toBe(true);
    expectCta(SHOWROOM.primary);
    expectCta(SHOWROOM.secondary);
  });
});

describe('HOME_REVIEWS', () => {
  it('is a non-empty list of testimonials with a rating in 1–5', () => {
    expect(HOME_REVIEWS.length).toBeGreaterThan(0);
    for (const r of HOME_REVIEWS) {
      expect(isNonEmptyString(r.quote)).toBe(true);
      expect(isNonEmptyString(r.name)).toBe(true);
      expect(isNonEmptyString(r.model)).toBe(true);
      expect(typeof r.rating).toBe('number');
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
    }
  });

  it('has unique name+model pairs (stable React keys)', () => {
    const keys = HOME_REVIEWS.map((r) => `${r.name}-${r.model}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('STORE_RATING', () => {
  it('exposes a numeric score (0–5) and a numeric count for the reviews header', () => {
    expect(typeof STORE_RATING.score).toBe('number');
    expect(STORE_RATING.score).toBeGreaterThanOrEqual(0);
    expect(STORE_RATING.score).toBeLessThanOrEqual(5);
    expect(typeof STORE_RATING.count).toBe('number');
    expect(STORE_RATING.count).toBeGreaterThan(0);
  });
});
