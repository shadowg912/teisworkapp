import { describe, expect, it } from 'vitest';

import { calculateGoal } from './model';
import type { Goal, GoalEntry } from './model';

const goal: Goal = {
  id: 'goal-1',
  name: 'Objetivo de utilidad',
  target: 150000,
  currency: 'DOP',
  status: 'active',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  version: 1,
};

const entries: GoalEntry[] = [
  {
    id: '1',
    operationId: 'op-1',
    goalId: 'goal-1',
    date: '2026-11-10',
    type: 'contribution',
    account: 'Banco',
    amount: 12000,
    currency: 'DOP',
    note: '',
    createdAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: '2',
    operationId: 'op-2',
    goalId: 'goal-1',
    date: '2026-11-05',
    type: 'investment_withdrawal',
    account: 'Banco',
    amount: 8000,
    currency: 'DOP',
    note: '',
    createdAt: '2026-11-05T00:00:00.000Z',
  },
  {
    id: '3',
    operationId: 'op-3',
    goalId: 'goal-1',
    date: '2026-10-28',
    type: 'contribution',
    account: 'Caja',
    amount: 18000,
    currency: 'DOP',
    note: '',
    createdAt: '2026-10-28T00:00:00.000Z',
  },
  {
    id: '4',
    operationId: 'op-4',
    goalId: 'goal-1',
    date: '2026-10-15',
    type: 'contribution',
    account: 'Banco',
    amount: 15000,
    currency: 'DOP',
    note: '',
    createdAt: '2026-10-15T00:00:00.000Z',
  },
  {
    id: '5',
    operationId: 'op-5',
    goalId: 'goal-1',
    date: '2026-09-30',
    type: 'contribution',
    account: 'Caja',
    amount: 13000,
    currency: 'DOP',
    note: '',
    createdAt: '2026-09-30T00:00:00.000Z',
  },
];

describe('calculateGoal', () => {
  it('calcula el capital guardado neto de retiros', () => {
    const summary = calculateGoal(goal, entries);

    expect(summary.contributed).toBe(58000);
    expect(summary.withdrawn).toBe(8000);
    expect(summary.saved).toBe(50000);
    expect(summary.progress).toBeCloseTo(1 / 3, 5);
    expect(summary.remaining).toBe(100000);
  });

  it('limita el progreso a 100% y evita un restante negativo', () => {
    const summary = calculateGoal({ ...goal, target: 10000 }, entries);

    expect(summary.progress).toBe(1);
    expect(summary.remaining).toBe(0);
  });

  it('devuelve progreso cero si no hay meta', () => {
    const summary = calculateGoal(null, entries);

    expect(summary.progress).toBe(0);
    expect(summary.remaining).toBe(0);
  });
});
