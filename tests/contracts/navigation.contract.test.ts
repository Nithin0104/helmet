import { describe, expect, it } from 'vitest';
import {
  DESKTOP_NAV,
  MOBILE_NAV,
  ANNOUNCEMENTS,
  TRENDING,
  BRANDS,
  FOOTER_COLUMNS,
} from '../../src/data/navigation';

/**
 * Guards the site-chrome content module. The header, footer, and search read
 * these shapes; a break here breaks the shell on every route.
 */

describe('navigation content contract', () => {
  it.each([
    ['DESKTOP_NAV', DESKTOP_NAV],
    ['MOBILE_NAV', MOBILE_NAV],
  ])('%s items have non-empty label and rooted href', (_name, items) => {
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  it('mobile nav is a superset of desktop nav labels', () => {
    const desktop = DESKTOP_NAV.map((n) => n.label);
    const mobile = MOBILE_NAV.map((n) => n.label);
    expect(desktop.every((label) => mobile.includes(label))).toBe(true);
  });

  it.each([
    ['ANNOUNCEMENTS', ANNOUNCEMENTS],
    ['TRENDING', TRENDING],
    ['BRANDS', BRANDS],
  ])('%s is a non-empty list of non-empty strings', (_name, list) => {
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((s) => typeof s === 'string' && s.length > 0)).toBe(true);
  });

  it('footer columns have a heading and at least one item', () => {
    expect(FOOTER_COLUMNS.length).toBeGreaterThan(0);
    for (const col of FOOTER_COLUMNS) {
      expect(col.h.length).toBeGreaterThan(0);
      expect(col.items.length).toBeGreaterThan(0);
      expect(col.items.every((i) => i.length > 0)).toBe(true);
    }
  });
});
