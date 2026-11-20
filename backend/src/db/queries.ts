/**
 * Consultas SQL para el backend de TEIS workapp.
 *
 * Todas las funciones reciben un cliente pg ya conectado y devuelven los
 * resultados de las consultas. Los importes se manejan como NUMERIC y se
 * convierten a number en JavaScript (precisión suficiente para este uso).
 */

import { Client } from 'pg';

export type FinanceMovementRow = {
  id: string;
  operation_id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  effect: string;
  account_code: string;
  counterpart_account_code?: string;
  amount: number;
  currency: string;
  occurred_at: string;
  note?: string;
  correction_of?: string;
  goal_entry_id?: string;
  created_at: string;
};

export type GoalRow = {
  id: string;
  name: string;
  target: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  version: number;
};

export type GoalEntryRow = {
  id: string;
  operation_id: string;
  goal_id: string;
  date: string;
  type: string;
  account_code: string;
  amount: number;
  currency: string;
  note: string;
  created_at: string;
};

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  min_stock: number;
  cost: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
};

export type StockMovementRow = {
  id: string;
  operation_id: string;
  product_id: string;
  type: string;
  quantity: number;
  unit_cost?: number;
  reason?: string;
  occurred_at: string;
  created_at: string;
};

/* ============ Finanzas ============ */

export async function listFinancialMovements(
  client: Client
): Promise<FinanceMovementRow[]> {
  const result = await client.query(
    `
    select id, operation_id, occurred_at as date, description, category, type,
           case
             when type in ('capital_contribution','income','investment_withdrawal') then 'in'
             when type in ('expense','saved_capital') then 'out'
             when type = 'transfer' then 'neutral'
             when type = 'correction' then 'neutral'
             else 'neutral'
           end as effect,
           account_code, counterpart_account_code, amount, currency,
           occurred_at, note, correction_of, goal_entry_id, created_at
    from financial_movements
    order by occurred_at desc, created_at desc
    `,
    []
  );

  return result.rows;
}

export async function createFinancialMovement(
  client: Client,
  input: {
    operationId: string;
    type: string;
    accountCode: string;
    counterpartAccountCode?: string;
    amount: number;
    currency: string;
    occurredAt: string;
    description: string;
    category: string;
    note?: string;
    goalEntryId?: string;
  }
): Promise<FinanceMovementRow> {
  const result = await client.query(
    `
    insert into financial_movements (
      operation_id, type, account_code, counterpart_account_code,
      amount, currency, occurred_at, description, category, note, goal_entry_id
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    returning id, operation_id, occurred_at as date, description, category, type,
           case
             when type in ('capital_contribution','income','investment_withdrawal') then 'in'
             when type in ('expense','saved_capital') then 'out'
             when type = 'transfer' then 'neutral'
             when type = 'correction' then 'neutral'
             else 'neutral'
           end as effect,
           account_code, counterpart_account_code, amount, currency,
           occurred_at, note, correction_of, goal_entry_id, created_at
    `,
    [
      input.operationId,
      input.type,
      input.accountCode,
      input.counterpartAccountCode ?? null,
      input.amount,
      input.currency,
      input.occurredAt,
      input.description,
      input.category,
      input.note ?? null,
      input.goalEntryId ?? null,
    ]
  );

  return result.rows[0];
}

/* ============ Objetivo ============ */

export async function getActiveGoal(client: Client): Promise<GoalRow | null> {
  const result = await client.query(
    `
    select id, name, target, currency, status, created_at, updated_at, version
    from goals
    where status = 'active'
    order by created_at desc
    limit 1
    `,
    []
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

export async function createGoal(
  client: Client,
  input: {
    name: string;
    target: number;
    currency: string;
  }
): Promise<GoalRow> {
  const result = await client.query(
    `
    insert into goals (name, target, currency, status)
    values ($1, $2, $3, 'active')
    returning id, name, target, currency, status, created_at, updated_at, version
    `,
    [input.name, input.target, input.currency]
  );

  return result.rows[0];
}

export async function updateGoal(
  client: Client,
  input: {
    id: string;
    name: string;
    target: number;
    currency: string;
  }
): Promise<GoalRow> {
  const result = await client.query(
    `
    update goals
    set name = $2, target = $3, currency = $4, updated_at = now(),
        version = version + 1
    where id = $1
    returning id, name, target, currency, status, created_at, updated_at, version
    `,
    [input.id, input.name, input.target, input.currency]
  );

  if (result.rowCount === 0) {
    throw new Error('Objetivo no encontrado.');
  }

  return result.rows[0];
}

export async function listGoalEntries(
  client: Client,
  goalId: string
): Promise<GoalEntryRow[]> {
  const result = await client.query(
    `
    select id, operation_id, goal_id, date, type, account_code, amount,
           currency, note, created_at
    from goal_entries
    where goal_id = $1
    order by date desc, created_at desc
    `,
    [goalId]
  );

  return result.rows;
}

export async function createGoalEntry(
  client: Client,
  input: {
    operationId: string;
    goalId: string;
    type: string;
    accountCode: string;
    amount: number;
    currency: string;
    date: string;
    note: string;
  }
): Promise<GoalEntryRow> {
  const result = await client.query(
    `
    insert into goal_entries (
      operation_id, goal_id, type, account_code, amount, currency,
      date, note
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    returning id, operation_id, goal_id, date, type, account_code, amount,
              currency, note, created_at
    `,
    [
      input.operationId,
      input.goalId,
      input.type,
      input.accountCode,
      input.amount,
      input.currency,
      input.date,
      input.note,
    ]
  );

  return result.rows[0];
}

/* ============ Inventario ============ */

export async function listProducts(client: Client): Promise<ProductRow[]> {
  const result = await client.query(
    `
    select id, sku, name, unit, min_stock, cost, price, is_active,
           created_at, updated_at, version, deleted_at
    from products
    where is_active = true
    order by name
    `,
    []
  );

  return result.rows;
}

export async function createProduct(
  client: Client,
  input: {
    sku: string;
    name: string;
    unit: string;
    minStock: number;
    cost: number;
    price: number;
  }
): Promise<ProductRow> {
  const result = await client.query(
    `
    insert into products (sku, name, unit, min_stock, cost, price)
    values ($1, $2, $3, $4, $5, $6)
    returning id, sku, name, unit, min_stock, cost, price, is_active,
              created_at, updated_at, version, deleted_at
    `,
    [input.sku, input.name, input.unit, input.minStock, input.cost, input.price]
  );

  return result.rows[0];
}

export async function listStockMovements(
  client: Client,
  productId?: string
): Promise<StockMovementRow[]> {
  if (productId) {
    const result = await client.query(
      `
      select id, operation_id, product_id, type, quantity, unit_cost,
             reason, occurred_at, created_at
      from stock_movements
      where product_id = $1
      order by occurred_at desc, created_at desc
      `,
      [productId]
    );
    return result.rows;
  }

  const result = await client.query(
    `
    select id, operation_id, product_id, type, quantity, unit_cost,
           reason, occurred_at, created_at
    from stock_movements
    order by occurred_at desc, created_at desc
    `
  );
  return result.rows;
}

export async function createStockMovement(
  client: Client,
  input: {
    operationId: string;
    productId: string;
    type: string;
    quantity: number;
    unitCost?: number;
    reason?: string;
    occurredAt: string;
  }
): Promise<StockMovementRow> {
  const result = await client.query(
    `
    insert into stock_movements (
      operation_id, product_id, type, quantity, unit_cost, reason, occurred_at
    )
    values ($1, $2, $3, $4, $5, $6, $7)
    returning id, operation_id, product_id, type, quantity, unit_cost,
              reason, occurred_at, created_at
    `,
    [
      input.operationId,
      input.productId,
      input.type,
      input.quantity,
      input.unitCost ?? null,
      input.reason ?? null,
      input.occurredAt,
    ]
  );

  return result.rows[0];
}
