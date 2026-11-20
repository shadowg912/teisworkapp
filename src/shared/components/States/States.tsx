import type { ReactNode } from 'react';

import { Button } from '../Button/Button';
import styles from './States.module.css';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.state} role="status">
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'No se pudo cargar la información',
  description = 'Revisa la conexión e inténtalo de nuevo.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.state} role="alert">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {onRetry ? (
        <div className={styles.action}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = 'Cargando información' }: { label?: string }) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className={styles.skeletonGroup} aria-hidden="true">
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
      </div>
    </div>
  );
}
