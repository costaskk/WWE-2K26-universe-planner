create table if not exists public.universes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.universes enable row level security;

create policy "Users can view their own universe"
on public.universes
for select
using (auth.uid() = user_id);

create policy "Users can insert their own universe"
on public.universes
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own universe"
on public.universes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own universe"
on public.universes
for delete
using (auth.uid() = user_id);
