import type { Account } from '../../shared/types/accounts';
import type { Currency } from '../../shared/utils/format';

export type MovementType =
  | 'capital_contribution'
  | 'income'
  | 'expense'
  | 'transfer'
  | 'saved_capital'
  | 'investment_withdrawal'
  | 'correction';

export type MovementEffect = 'in' | 'out' | 'neutral';

export type CorrectionDirection = 'in' | 'out';

export type FinanceMovement = {
  id: string;
  operationId: string;
  date: string;
  description: string;
  category: string;
  type: MovementType;
  effect: MovementEffect;
  account: Account;
  counterpart?: Account;
  amount: number;
  currency: Currency;
  note?: string;
  correctionOf?: string;
  goalEntryId?: string;
  createdAt: string;
};

export type FinanceSummary = {
  caja: number;
  banco: number;
  available: number;
  saved: number;
  total: number;
  income: number;
  expenses: number;
  result: number;
};

export const movementTypeLabels: Record<MovementType, string> = {
  capital_contribution: 'Aporte de capital',
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  saved_capital: 'Capital guardado',
  investment_withdrawal: 'Retiro para inversión',
  correction: 'Corrección',
};

export const movementTypeDescriptions: Record<MovementType, string> = {
  capital_contribution: 'Dinero aportado desde fuera del negocio.',
  income: 'Cobro por una venta u otra entrada operativa.',
  expense: 'Pago operativo. No incluye guardar capital.',
  transfer: 'Traslado entre Caja y Banco. No es ingreso ni gasto.',
  saved_capital: 'Sale de una cuenta y se guarda en el objetivo.',
  investment_withdrawal: 'Sale del objetivo y vuelve a una cuenta.',
  correction: 'Movimiento nuevo para compensar un error.',
};

export function movementEffect(
  type: MovementType,
  correctionDirection: CorrectionDirection = 'in',
): MovementEffect {
  switch (type) {
    case 'capital_contribution':
    case 'income':
    case 'investment_withdrawal':
      return 'in';
    case 'expense':
    case 'saved_capital':
      return 'out';
    case 'transfer':
      return 'neutral';
    case 'correction':
      return correctionDirection;
  }
}

export function isGoalMovement(type: MovementType): boolean {
  return type === 'saved_capital' || type === 'investment_withdrawal';
}

export function defaultCategory(type: MovementType): string {
  switch (type) {
    case 'capital_contribution':
      return 'Capital';
    case 'income':
      return 'Ingresos';
    case 'expense':
      return 'Gastos';
    case 'transfer':
      return 'Traslado interno';
    case 'saved_capital':
    case 'investment_withdrawal':
      return 'Objetivo';
    case 'correction':
      return 'Ajustes';
  }
}

export function getMonthKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

function addToAccount(
  balances: { Caja: number; Banco: number },
  account: Account,
  amount: number,
): void {
  balances[account] += amount;
}

export function calculateFinance(
  movements: FinanceMovement[],
  options: { month?: string } = {},
): FinanceSummary {
  const balances = { Caja: 0, Banco: 0 };
  let saved = 0;
  let income = 0;
  let expenses = 0;

  for (const movement of movements) {
    const inMonth = options.month ? movement.date.startsWith(options.month) : true;

    switch (movement.type) {
      case 'capital_contribution':
        addToAccount(balances, movement.account, movement.amount);
        break;
      case 'income':
        addToAccount(balances, movement.account, movement.amount);
        if (inMonth) {
          income += movement.amount;
        }
        break;
      case 'expense':
        addToAccount(balances, movement.account, -movement.amount);
        if (inMonth) {
          expenses += movement.amount;
        }
        break;
      case 'transfer':
        if (movement.counterpart) {
          addToAccount(balances, movement.account, -movement.amount);
          addToAccount(balances, movement.counterpart, movement.amount);
        }
        break;
      case 'saved_capital':
        addToAccount(balances, movement.account, -movement.amount);
        saved += movement.amount;
        break;
      case 'investment_withdrawal':
        addToAccount(balances, movement.account, movement.amount);
        saved -= movement.amount;
        break;
      case 'correction':
        addToAccount(
          balances,
          movement.account,
          movement.effect === 'out' ? -movement.amount : movement.amount,
        );
        break;
    }
  }

  const available = balances.Caja + balances.Banco;

  return {
    caja: balances.Caja,
    banco: balances.Banco,
    available,
    saved,
    total: available + saved,
    income,
    expenses,
    result: income - expenses,
  };
}
