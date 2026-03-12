create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  constraint app_users_username_format check (username ~ '^[a-z0-9_-]{3,24}$')
);

create table if not exists universes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  slot_name text not null default 'Main Universe',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table universes
  add column if not exists slot_name text not null default 'Main Universe';

alter table universes
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists universes_user_slot_name_unique
  on universes (user_id, lower(slot_name));

create index if not exists universes_user_updated_idx
  on universes (user_id, updated_at desc);
