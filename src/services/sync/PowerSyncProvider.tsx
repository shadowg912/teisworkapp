/**
 * Proveedor de PowerSync para TEIS workapp.
 *
 * Inicializa la base de datos SQLite local de PowerSync y gestiona el estado
 * de conexión con el servidor PowerSync. Mientras el servidor no esté
 * disponible ni exista autenticación de backend, la aplicación funciona con
 * el almacén local (localStorage + outbox) y se reconecta automáticamente
 * cuando el servidor esté listo.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Authenticator, DownloadOptions } from '@powersync/common';

import { db, POWERSYNC_URL } from './powersync.client';
import { getToken } from '../../services/auth/authService';

type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type PowerSyncContextValue = {
  status: SyncStatus;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  database: typeof db;
};

const PowerSyncContext = createContext<PowerSyncContextValue | null>(null);

/**
 * Autenticador de PowerSync.
 *
 * Obtiene el JWT del almacén de autenticación del frontend (que a su vez lo
 * obtiene del backend Fastify tras el login del usuario). Mientras no haya
 * sesión activa, PowerSync funciona en modo solo-lectura local.
 */
const authenticator: Authenticator = {
  resolveCredentials: async (): Promise<string> => {
    const token = getToken();

    if (!token) {
      throw new Error('No hay sesión activa para sincronizar con PowerSync.');
    }

    return token;
  },
};

export function PowerSyncProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [status, setStatus] = useState<SyncStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setStatus('connecting');
    setError(null);

    try {
      const downloadOptions: DownloadOptions = {
        powerSyncEndpoint: POWERSYNC_URL,
        authenticator,
      };

      await db.connect(downloadOptions);
      setStatus('connected');
    } catch (err) {
      // Error esperado mientras no haya servidor PowerSync ni autenticación.
      setStatus('error');
      setError(
        err instanceof Error ? err.message : 'Error conectando a PowerSync.',
      );
    }
  };

  const disconnect = async () => {
    setStatus('disconnected');
    try {
      await db.close();
    } catch {
      /* ignorar errores al cerrar */
    }
  };

  useEffect(() => {
    // Intentar conectar al montar. Si falla, la app sigue en modo local.
    connect().catch(() => {
      setStatus('error');
    });

    return () => {
      disconnect().catch(() => {
        /* ignorar al desmontar */
      });
    };
  }, []);

  const value: PowerSyncContextValue = {
    status,
    isConnected: status === 'connected',
    error,
    connect,
    disconnect,
    database: db,
  };

  return (
    <PowerSyncContext.Provider value={value}>{children}</PowerSyncContext.Provider>
  );
}

export function usePowerSync(): PowerSyncContextValue {
  const context = useContext(PowerSyncContext);

  if (!context) {
    throw new Error('usePowerSync debe usarse dentro de PowerSyncProvider.');
  }

  return context;
}
