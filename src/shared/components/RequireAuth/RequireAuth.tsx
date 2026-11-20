import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { fetchSession, isAuthenticated } from '../../../services/auth/authService';

/**
 * Componente que protege rutas que requieren autenticación.
 * Verifica la sesión con el backend y redirige a /auth si no hay sesión activa.
 */
export function RequireAuth() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        await fetchSession();
      } catch {
        // Ignorar errores de red
      }

      if (mounted) {
        setChecking(false);
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return null;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
