-- Tabla de usuarios para autenticación (TAD-07)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(btrim(email)) > 0),
  password_hash text not null check (length(btrim(password_hash)) > 0),
  created_at timestamptz not null default now()
);

create index users_email_idx on users (email);
