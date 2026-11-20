import { Link } from 'react-router-dom';

import { EmptyState } from '../../shared/components/States/States';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Esa pantalla no existe"
      description="La dirección no corresponde a ningún módulo disponible en esta versión."
      action={
        <Link className={styles.link} to="/">
          Volver al dashboard
        </Link>
      }
    />
  );
}
