-- Execute this in the Supabase SQL editor before enabling album saving.
-- It lets each authenticated user save and reload their own album configuration.

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Album souvenir',
  album_type text not null default 'souvenir',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists albums_user_id_updated_at_idx
  on public.albums (user_id, updated_at desc);

alter table public.albums enable row level security;

drop policy if exists "Users can read own albums"
  on public.albums;

create policy "Users can read own albums"
  on public.albums
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own albums"
  on public.albums;

create policy "Users can insert own albums"
  on public.albums
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own albums"
  on public.albums;

create policy "Users can update own albums"
  on public.albums
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own albums"
  on public.albums;

create policy "Users can delete own albums"
  on public.albums
  for delete
  to authenticated
  using (auth.uid() = user_id);
