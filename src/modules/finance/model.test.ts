import { describe, expect, it } from 'vitest';

import { calculateFinance, movementEffect } from './model';
import type { FinanceMovement, MovementType } from './model';

let sequence = 0;

function movement(
  type: MovementType,
  amount: number,
  account: 'Caja' | 'Banco',
  extra: Partial<FinanceMovement> = {},
): FinanceMovement {
  sequence += 1;
  return {
    id: `movement-${sequence}`,
    operationId: `operation-${sequence}`,
    date: '2026-11-20',
    description: type,
    category: 'Prueba',
    type,
    effect: movementEffect(type),
    account,
    amount,
    currency: 'DOP',
    createdAt: '2026-11-20T12:00:00.000Z',
    ...extra,
  };
}

describe('calculateFinance', () => {
  it('calcula saldos, capital guardado y resultado del mes', () => {
    const movements = [
      movement('capital_contribution', 1000, 'Caja'),
      movement('income', 500, 'Caja'),
      movement('expense', 200, 'Caja'),
      movement('transfer', 300, 'Caja', { counterpart: 'Banco', effect: 'neutral' }),
      movement('saved_capital', 200, 'Banco'),
      movement('investment_withdrawal', 50, 'Banco'),
      movement('correction', 25, 'Caja', { effect: 'in' }),
    ];

    const summary = calculateFinance(movements, { month: '2026-11' });

    expect(summary.caja).toBe(1025);
    expect(summary.banco).toBe(150);
    expect(summary.available).toBe(1175);
    expect(summary.saved).toBe(150);
    expect(summary.total).toBe(1325);
    expect(summary.income).toBe(500);
    expect(summary.expenses).toBe(200);
    expect(summary.result).toBe(300);
  });

  it('no cuenta transferencias como ingreso ni gasto', () => {
    const summary = calculateFinance([
      movement('transfer', 500, 'Caja', { counterpart: 'Banco', effect: 'neutral' }),
    ]);

    expect(summary.income).toBe(0);
    expect(summary.expenses).toBe(0);
    expect(summary.caja).toBe(-500);
    expect(summary.banco).toBe(500);
  });

  it('filtra ingresos y gastos por mes sin alterar los saldos', () => {
    const summary = calculateFinance(
      [
        movement('income', 100, 'Caja', { date: '2026-10-31' }),
        movement('income', 200, 'Caja', { date: '2026-11-01' }),
        movement('expense', 50, 'Caja', { date: '2026-11-02' }),
      ],
      { month: '2026-11' },
    );

    expect(summary.income).toBe(200);
    expect(summary.expenses).toBe(50);
    expect(summary.caja).toBe(250);
  });
});
