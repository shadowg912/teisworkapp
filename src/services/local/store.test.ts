import { beforeEach, describe, expect, it } from 'vitest';

import {
  createFinanceMovement,
  createGoal,
  createGoalEntry,
  createProduct,
  createStockMovement,
  getSnapshot,
  resetLocalState,
} from './store';

const date = '2026-11-20';

beforeEach(() => {
  resetLocalState();
});

describe('almacén local', () => {
  it('registra productos y valida SKU y existencias', () => {
    const productResult = createProduct({
      name: 'Café',
      sku: 'CAF-1',
      unit: 'u',
      minStock: 5,
      cost: 100,
      price: 200,
    });

    expect(productResult).toEqual({ ok: true });
    expect(getSnapshot().products).toHaveLength(1);
    expect(getSnapshot().outbox.at(-1)?.kind).toBe('inventory.product.create');

    expect(
      createProduct({
        name: 'Otro café',
        sku: 'caf-1',
        unit: 'u',
        minStock: 1,
        cost: 1,
        price: 2,
      }),
    ).toEqual({ ok: false, error: 'Ya existe un producto con ese SKU.' });

    const productId = getSnapshot().products[0].id;

    expect(
      createStockMovement({
        productId,
        type: 'out',
        quantity: 1,
        date,
      }),
    ).toEqual({ ok: false, error: 'Solo hay 0 u disponibles de Café.' });

    expect(
      createStockMovement({
        productId,
        type: 'in',
        quantity: 10,
        date,
      }),
    ).toEqual({ ok: true });
    expect(getSnapshot().stockMovements).toHaveLength(1);
  });

  it('mantiene un solo objetivo activo y vincula aportes y retiros con finanzas', () => {
    expect(
      createGoal({ name: 'Meta', target: 1000, currency: 'DOP' }),
    ).toEqual({ ok: true });
    expect(
      createGoal({ name: 'Otra meta', target: 2000, currency: 'DOP' }),
    ).toEqual({
      ok: false,
      error: 'Ya existe un objetivo activo. Actualiza su meta antes de crear otro.',
    });

    expect(
      createGoalEntry({
        type: 'contribution',
        account: 'Banco',
        amount: 200,
        currency: 'DOP',
        date,
        note: '',
      }),
    ).toEqual({ ok: true });

    const afterContribution = getSnapshot();
    expect(afterContribution.goalEntries).toHaveLength(1);
    expect(afterContribution.movements).toHaveLength(1);
    expect(afterContribution.movements[0].type).toBe('saved_capital');
    expect(afterContribution.movements[0].goalEntryId).toBe(
      afterContribution.goalEntries[0].id,
    );
    expect(afterContribution.outbox.slice(-2).map((operation) => operation.kind)).toEqual([
      'goal.entry.create',
      'finance.movement.create',
    ]);

    expect(
      createGoalEntry({
        type: 'investment_withdrawal',
        account: 'Banco',
        amount: 50,
        currency: 'DOP',
        date,
        note: '',
      }),
    ).toEqual({
      ok: false,
      error: 'El retiro debe tener una nota que explique su destino.',
    });

    expect(
      createGoalEntry({
        type: 'investment_withdrawal',
        account: 'Banco',
        amount: 50,
        currency: 'DOP',
        date,
        note: 'Equipo',
      }),
    ).toEqual({ ok: true });
    expect(getSnapshot().movements[0].type).toBe('investment_withdrawal');

    expect(
      createGoalEntry({
        type: 'investment_withdrawal',
        account: 'Banco',
        amount: 500,
        currency: 'DOP',
        date,
        note: 'Equipo',
      }),
    ).toEqual({
      ok: false,
      error: 'El retiro supera el capital guardado disponible (150.00).',
    });
  });

  it('exige un objetivo activo para guardar capital desde finanzas', () => {
    expect(
      createFinanceMovement({
        type: 'saved_capital',
        date,
        description: 'Aporte al objetivo',
        category: 'Objetivo',
        account: 'Banco',
        amount: 100,
        currency: 'DOP',
      }),
    ).toEqual({
      ok: false,
      error: 'Primero crea un objetivo activo para guardar capital o registrar retiros.',
    });

    createGoal({ name: 'Meta', target: 1000, currency: 'DOP' });

    expect(
      createFinanceMovement({
        type: 'saved_capital',
        date,
        description: 'Aporte al objetivo',
        category: 'Objetivo',
        account: 'Banco',
        amount: 100,
        currency: 'DOP',
      }),
    ).toEqual({ ok: true });

    const snapshot = getSnapshot();
    expect(snapshot.goalEntries).toHaveLength(1);
    expect(snapshot.movements[0].goalEntryId).toBe(snapshot.goalEntries[0].id);
    expect(snapshot.outbox.at(-2)?.kind).toBe('goal.entry.create');
    expect(snapshot.outbox.at(-1)?.kind).toBe('finance.movement.create');
  });
});
