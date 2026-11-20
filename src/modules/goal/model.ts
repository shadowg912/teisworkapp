import type { Account } from '../../shared/types/accounts';
import type { Currency } from '../../shared/utils/format';

export type GoalStatus = 'active' | 'achieved' | 'cancelled';

export type GoalEntryType = 'contribution' | 'investment_withdrawal';

export type Goal = {
  id: string;
  name: string;
  target: number;
  currency: Currency;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type GoalEntry = {
  id: string;
  operationId: string;
  goalId: string;
  date: string;
  type: GoalEntryType;
  account: Account;
  amount: number;
  currency: Currency;
  note: string;
  createdAt: string;
};

export type GoalSummary = {
  contributed: number;
  withdrawn: number;
  saved: number;
  progress: number;
  remaining: number;
};

export function calculateGoal(
  goal: Goal | null,
  entries: GoalEntry[],
): GoalSummary {
  const contributed = entries
    .filter((entry) => entry.type === 'contribution')
    .reduce((total, entry) => total + entry.amount, 0);

  const withdrawn = entries
    .filter((entry) => entry.type === 'investment_withdrawal')
    .reduce((total, entry) => total + entry.amount, 0);

  const saved = contributed - withdrawn;
  const target = goal?.target ?? 0;
  const progress = target > 0 ? Math.min(Math.max(saved / target, 0), 1) : 0;
  const remaining = Math.max(target - saved, 0);

  return { contributed, withdrawn, saved, progress, remaining };
}
