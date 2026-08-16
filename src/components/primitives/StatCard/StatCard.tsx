import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { CountUp } from '../CountUp/CountUp';
import { Icon } from '../Icon/Icon';
import styles from './StatCard.module.css';

export type StatTrend = 'up' | 'down';

export interface StatCardProps {
  value: number;
  label: string;
  delta?: string | number;
  trend?: StatTrend;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  countUp?: boolean;
  duration?: number;
  className?: string;
}

export function StatCard({
  value,
  label,
  delta,
  trend,
  prefix = '',
  suffix = '',
  icon,
  countUp = true,
  duration = 1500,
  className,
}: StatCardProps) {
  return (
    <div className={cx(styles.card, className)}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.value}>
        {countUp ? (
          <CountUp value={value} prefix={prefix} suffix={suffix} duration={duration} />
        ) : (
          `${prefix}${value.toLocaleString('en-IN')}${suffix}`
        )}
      </span>
      <span className={styles.label}>{label}</span>
      {delta != null && (
        <span className={cx(styles.delta, trend && styles[trend])}>
          {trend === 'up' && <Icon icon={ChevronUp} size="sm" />}
          {trend === 'down' && <Icon icon={ChevronDown} size="sm" />}
          {delta}
        </span>
      )}
    </div>
  );
}
