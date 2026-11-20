import { beforeEach, describe, expect, it } from 'vitest';

import {
  createFinanceMovement,
  createGoal,
  getSnapshot,
  lockStore,
  resetLocalState,
  unlockStore,
} from './store';

const password = 'contraseña-de-prueba-123';

/**
 * Espera a que las operaciones de cifrado asíncronas (fire-and-forget en
 * persist) terminen de escribir en localStorage.
 */
async function flushEncrypt(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
}

beforeEach(() => {
  resetLocalState();
});

describe('almacén local con cifrado', () => {
  it('no persiste en localStorage sin clave de cifrado', async () => {
    const result = createFinanceMovement({
      type: 'income',
      date: '2026-11-20',
      description: 'Venta de prueba',
      category: 'Ventas',
      account: 'Caja',
      amount: 1000,
      currency: 'DOP',
    });

    expect(result).toEqual({ ok: true });

    // Los datos están en memoria...
    expect(getSnapshot().movements).toHaveLength(1);

    // ...pero no se guardaron en localStorage (sin clave de cifrado).
    expect(localStorage.getItem('teis.workapp.local.v1')).toBeNull();
  });

  it('guarda cifrado en localStorage después de desbloquear', async () => {
    // Primero desbloquear para tener clave de cifrado.
    await unlockStore(password);

    // Luego crear datos (se cifrarán al persistir).
    createGoal({
      name: 'Meta de prueba',
      target: 100000,
      currency: 'DOP',
    });

    // Esperar a que el cifrado asíncrono termine.
    await flushEncrypt();

    const snapshot = getSnapshot();
    expect(snapshot.goal).not.toBeNull();
    expect(snapshot.goal?.name).toBe('Meta de prueba');

    // Los datos deben estar cifrados en localStorage.
    const stored = localStorage.getItem('teis.workapp.local.v1');
    expect(stored).not.toBeNull();
    expect(stored).not.toContain('Meta de prueba'); // no texto plano
  });

  it('bloquea y limpia la memoria', async () => {
    await unlockStore(password);

    createGoal({
      name: 'Meta para bloquear',
      target: 50000,
      currency: 'DOP',
    });
    await flushEncrypt();
    expect(getSnapshot().goal).not.toBeNull();

    await lockStore();

    expect(getSnapshot().goal).toBeNull();
    expect(getSnapshot().movements).toHaveLength(0);
  });

  it('no descifra con contraseña incorrecta', async () => {
    // Crear y bloquear con contraseña correcta para dejar datos cifrados.
    await unlockStore(password);
    createGoal({
      name: 'Meta secreta',
      target: 99999,
      currency: 'DOP',
    });
    await flushEncrypt();
    await lockStore();

    // Reiniciar estado en memoria.
    resetLocalState();

    // Intentar desbloquear con contraseña incorrecta.
    await unlockStore('contraseña-incorrecta');

    // Con contraseña incorrecta, el estado debería estar vacío.
    expect(getSnapshot().goal).toBeNull();
    expect(getSnapshot().movements).toHaveLength(0);
  });

  it('resetLocalState limpia todo incluido localStorage', async () => {
    await unlockStore(password);

    createGoal({
      name: 'Meta temporal',
      target: 1000,
      currency: 'DOP',
    });
    await flushEncrypt();
    expect(localStorage.getItem('teis.workapp.local.v1')).not.toBeNull();

    resetLocalState();

    expect(getSnapshot().goal).toBeNull();
    expect(localStorage.getItem('teis.workapp.local.v1')).toBeNull();
  });
});
