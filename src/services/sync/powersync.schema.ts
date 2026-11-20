/**
 * Esquema de PowerSync para TEIS workapp.
 *
 * Define las tablas que se sincronizan entre PostgreSQL (servidor central) y
 * SQLite local (cliente web/Android). Los tipos y nombres de columna deben
 * coincidir con el esquema de PostgreSQL en db/migrations/001_initial.sql.
 *
 * Se utiliza la API de @powersync/common (Schema, Table, column) para definir
 * el esquema del cliente.
 */

import { column, Schema, Table } from '@powersync/common';

export const powersyncSchema = new Schema({
  accounts: new Table({
    id: column.text,
    code: column.text,
    name: column.text,
    currency: column.text,
    created_at: column.text,
  }),

  goals: new Table({
    id: column.text,
    name: column.text,
    target: column.real,
    currency: column.text,
    status: column.text,
    created_at: column.text,
    updated_at: column.text,
    version: column.integer,
  }),

  goal_entries: new Table({
    id: column.text,
    operation_id: column.text,
    goal_id: column.text,
    date: column.text,
    type: column.text,
    account_code: column.text,
    amount: column.real,
    currency: column.text,
    note: column.text,
    created_at: column.text,
  }),

  financial_movements: new Table({
    id: column.text,
    operation_id: column.text,
    type: column.text,
    account_code: column.text,
    counterpart_account_code: column.text,
    amount: column.real,
    currency: column.text,
    occurred_at: column.text,
    description: column.text,
    category: column.text,
    note: column.text,
    correction_of: column.text,
    goal_entry_id: column.text,
    created_at: column.text,
  }),

  products: new Table({
    id: column.text,
    sku: column.text,
    name: column.text,
    unit: column.text,
    min_stock: column.real,
    cost: column.real,
    price: column.real,
    is_active: column.integer,
    created_at: column.text,
    updated_at: column.text,
    version: column.integer,
    deleted_at: column.text,
  }),

  stock_movements: new Table({
    id: column.text,
    operation_id: column.text,
    product_id: column.text,
    type: column.text,
    quantity: column.real,
    unit_cost: column.real,
    reason: column.text,
    occurred_at: column.text,
    created_at: column.text,
  }),
});

export type PowersyncDatabase = typeof powersyncSchema extends Schema<
  infer S
>
  ? S['types']
  : never;
