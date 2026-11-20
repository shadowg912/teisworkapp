import { useLocalStore } from '../../../services/local/useLocalStore';
import styles from './SyncStatus.module.css';

export function SyncStatus() {
  const { outbox } = useLocalStore();
  const pending = outbox.length;
  const label =
    pending === 0
      ? 'Guardado localmente'
      : `${pending} cambio${pending === 1 ? '' : 's'} pendiente${pending === 1 ? '' : 's'}`;

  return (
    <div
      className={styles.status}
      title={
        pending === 0
          ? 'Los datos están guardados en este dispositivo. La sincronización con el servidor aún no está configurada.'
          : 'Hay cambios guardados en este dispositivo esperando sincronización con el servidor.'
      }
    >
      <span
        className={[styles.dot, pending > 0 ? styles.pending : styles.ok]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
