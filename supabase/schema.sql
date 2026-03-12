create extension if not exists pgcrypto;

create table if not exists public.universes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint universes_user_slot_unique unique (user_id, slot_name)
);

alter table public.universes enable row level security;

create policy "Users can view their own universes"
on public.universes
for select
using (auth.uid() = user_id);

create policy "Users can insert their own universes"
on public.universes
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own universes"
on public.universes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own universes"
on public.universes
for delete
using (auth.uid() = user_id);
