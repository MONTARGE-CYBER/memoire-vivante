-- Execute this in the Supabase SQL editor before opening the app to real users.
-- It ensures each authenticated user can only access their own restorations.

alter table public.restorations enable row level security;

drop policy if exists "Users can read own restorations"
  on public.restorations;

create policy "Users can read own restorations"
  on public.restorations
  for select
  to authenticated
  using (auth.uid()::text = user_id::text);

drop policy if exists "Users can insert own restorations"
  on public.restorations;

create policy "Users can insert own restorations"
  on public.restorations
  for insert
  to authenticated
  with check (auth.uid()::text = user_id::text);

drop policy if exists "Users can delete own restorations"
  on public.restorations;

create policy "Users can delete own restorations"
  on public.restorations
  for delete
  to authenticated
  using (auth.uid()::text = user_id::text);

drop policy if exists "Users can update own restorations"
  on public.restorations;

create policy "Users can update own restorations"
  on public.restorations
  for update
  to authenticated
  using (auth.uid()::text = user_id::text)
  with check (auth.uid()::text = user_id::text);
