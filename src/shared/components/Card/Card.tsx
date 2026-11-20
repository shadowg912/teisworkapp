import type { ReactNode } from 'react';

import styles from './Card.module.css';

type CardProps = {
  children: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  padding?: 'default' | 'none';
  className?: string;
};

export function Card({ children, title, action, padding = 'default', className }: CardProps) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-padding={padding}
    >
      {title || action ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {action ? <div className={styles.action}>{action}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
