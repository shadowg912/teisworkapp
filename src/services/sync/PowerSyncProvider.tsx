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
 * Obtiene un JWT de autenticación del backend Fastify (TAD-07). Mientras el
 * backend no implemente endpoints de autenticación, devuelve null y PowerSync
 * funciona en modo solo-lectura local.
 */
const authenticator: Authenticator = {
  resolveCredentials: async (_options): Promise<string> => {
    // TODO: llamar al backend Fastify para obtener un JWT de sesión.
    // El backend debe exponer un endpoint como POST /auth/session que devuelva
    // un token válido para PowerSync.
    throw new Error('Autenticación de backend no implementada aún (TAD-07).');
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
