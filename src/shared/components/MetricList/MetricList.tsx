import type { ReactNode } from 'react';

import styles from './MetricList.module.css';

export type Metric = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function MetricList({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className={styles.list}>
      {metrics.map((metric) => (
        <div key={metric.label} className={styles.item}>
          <dt className={styles.label}>{metric.label}</dt>
          <dd className={styles.value}>{metric.value}</dd>
          {metric.hint ? <p className={styles.hint}>{metric.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}
