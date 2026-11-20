import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../shared/components/Button/Button';
import { Card } from '../../shared/components/Card/Card';
import { PageHeader } from '../../shared/components/PageHeader/PageHeader';
import { TextField } from '../../shared/components/TextField/TextField';
import { login } from '../../services/auth/authService';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('shadow');
  const [password, setPassword] = useState('J3sk0921');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Iniciar sesión"
        description="Ingresa tus credenciales para acceder a TEIS workapp."
      />

      <Card className={styles.loginCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Usuario"
            type="text"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="shadow"
            required
          />

          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? (
            <p className={styles.error}>{error}</p>
          ) : null}

          <div className={styles.actions}>
            <Button type="submit" loading={loading}>
              Iniciar sesión
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
