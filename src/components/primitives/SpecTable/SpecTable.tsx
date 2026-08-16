import { cx } from '../../../lib/cx';
import styles from './SpecTable.module.css';

export type SpecTableRow = { label: string; value: string } | [string, string];

export interface SpecTableProps {
  items: SpecTableRow[];
  /** Subtle striping on alternate rows. @default true */
  zebra?: boolean;
  className?: string;
}

function normalize(row: SpecTableRow): { label: string; value: string } {
  return Array.isArray(row) ? { label: row[0], value: row[1] } : row;
}

/**
 * Responsive label/value specification table. Renders as a semantic definition
 * list (`<dl>`) that lays out as two columns on wider viewports and stacks on
 * narrow ones. Accepts `{ label, value }` objects or `[label, value]` tuples.
 */
export function SpecTable({ items, zebra = true, className }: SpecTableProps) {
  return (
    <dl className={cx(styles.table, className)}>
      {items.map((raw, i) => {
        const { label, value } = normalize(raw);
        return (
          <div
            key={`${label}-${i}`}
            className={cx(styles.row, zebra && i % 2 === 0 && styles.striped)}
          >
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
