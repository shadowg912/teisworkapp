export type Account = 'Caja' | 'Banco';

export type AccountCode = 'caja' | 'banco';

export const accounts: readonly Account[] = ['Caja', 'Banco'];

export const accountCodes: Record<Account, AccountCode> = {
  Caja: 'caja',
  Banco: 'banco',
};

export const accountFromCode: Record<AccountCode, Account> = {
  caja: 'Caja',
  banco: 'Banco',
};
