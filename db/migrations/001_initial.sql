-- TEIS workapp — esquema inicial
-- Importes monetarios en NUMERIC. Movimientos financieros y de inventario inmutables.

create extension if not exists pgcrypto;

-- Cuentas fijas aprobadas en PRD-02.
create table accounts (
  code text primary key check (code in ('caja', 'banco')),
  name text not null,
  currency char(3) not null default 'DOP' check (currency in ('DOP', 'USD')),
  created_at timestamptz not null default now()
);

insert into accounts (code, name)
values ('caja', 'Caja'), ('banco', 'Banco')
on conflict (code) do nothing;

-- Objetivo de utilidad. Solo puede existir uno activo (PRD-13).
create table goals (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Objetivo de utilidad',
  target numeric(14, 2) not null check (target > 0),
  currency char(3) not null default 'DOP' check (currency in ('DOP', 'USD')),
  status text not null default 'active' check (status in ('active', 'achieved', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create unique index goals_one_active on goals (status) where status = 'active';

-- Movimientos del objetivo. Son inmutables.
create table goal_entries (
  id uuid primary key default gen_random_uuid(),
  operation_id text not null unique,
  goal_id uuid not null references goals (id),
  type text not null check (type in ('contribution', 'investment_withdrawal')),
  account_code text not null references accounts (code),
  amount numeric(14, 2) not null check (amount > 0),
  currency char(3) not null default 'DOP' check (currency in ('DOP', 'USD')),
  occurred_at timestamptz not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  constraint goal_withdrawal_note check (
    type <> 'investment_withdrawal' or length(btrim(note)) > 0
  )
);

create index goal_entries_goal_idx on goal_entries (goal_id, occurred_at desc);

-- Movimientos financieros. Son inmutables.
create table financial_movements (
  id uuid primary key default gen_random_uuid(),
  operation_id text not null unique,
  type text not null check (
    type in (
      'capital_contribution',
      'income',
      'expense',
      'transfer',
      'saved_capital',
      'investment_withdrawal',
      'correction'
    )
  ),
  account_code text not null references accounts (code),
  counterpart_account_code text references accounts (code),
  amount numeric(14, 2) not null check (amount > 0),
  currency char(3) not null default 'DOP' check (currency in ('DOP', 'USD')),
  occurred_at timestamptz not null,
  description text not null check (length(btrim(description)) > 0),
  category text,
  note text,
  correction_of uuid references financial_movements (id),
  goal_entry_id uuid unique references goal_entries (id),
  created_at timestamptz not null default now(),
  constraint transfer_accounts check (
    (
      type = 'transfer'
      and counterpart_account_code is not null
      and counterpart_account_code <> account_code
    )
    or (type <> 'transfer' and counterpart_account_code is null)
  ),
  constraint correction_reference check (
    type = 'correction' or correction_of is null
  ),
  constraint goal_movements_linked check (
    type not in ('saved_capital', 'investment_withdrawal')
    or goal_entry_id is not null
  )
);

create index financial_movements_occurred_idx on financial_movements (occurred_at desc);
create index financial_movements_account_idx on financial_movements (account_code, occurred_at desc);
create index financial_movements_goal_entry_idx on financial_movements (goal_entry_id);

-- Productos. Entidad modificable con borrado lógico.
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null check (length(btrim(name)) > 0),
  unit text not null default 'u',
  min_stock numeric(14, 3) not null default 0 check (min_stock >= 0),
  cost numeric(14, 2) not null default 0 check (cost >= 0),
  price numeric(14, 2) not null default 0 check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  deleted_at timestamptz
);

create index products_name_idx on products (name);

-- Movimientos de inventario. Son la fuente de verdad y son inmutables.
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  operation_id text not null unique,
  product_id uuid not null references products (id),
  type text not null check (type in ('in', 'out')),
  quantity numeric(14, 3) not null check (quantity > 0),
  unit_cost numeric(14, 2) check (unit_cost is null or unit_cost >= 0),
  reason text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index stock_movements_product_idx on stock_movements (product_id, occurred_at desc);

-- Saldo calculado desde los movimientos. No es una tabla editable.
create or replace view inventory_balances as
select
  p.id as product_id,
  coalesce(
    sum(case when m.type = 'in' then m.quantity else -m.quantity end),
    0
  ) as quantity,
  max(m.occurred_at) as last_movement_at
from products p
left join stock_movements m on m.product_id = p.id
group by p.id;

-- Inmutabilidad de movimientos confirmados.
create or replace function prevent_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception
    'La tabla % es inmutable. Registra un movimiento compensatorio.',
    TG_TABLE_NAME;
end;
$$;

create trigger financial_movements_immutable
before update or delete on financial_movements
for each row execute function prevent_mutation();

create trigger goal_entries_immutable
before update or delete on goal_entries
for each row execute function prevent_mutation();

create trigger stock_movements_immutable
before update or delete on stock_movements
for each row execute function prevent_mutation();

-- updated_at y versión para entidades modificables.
create or replace function touch_mutable_row()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  return new;
end;
$$;

create trigger goals_touch before update on goals
for each row execute function touch_mutable_row();

create trigger products_touch before update on products
for each row execute function touch_mutable_row();
