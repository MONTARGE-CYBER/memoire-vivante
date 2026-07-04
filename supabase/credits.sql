-- Execute this in the Supabase SQL editor before enabling paid credits.
-- It adds a minimal credit wallet and marks restored photos as unlocked.

alter table public.restorations
  add column if not exists unlocked_at timestamptz;

create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('purchase', 'unlock', 'admin_adjustment')),
  restoration_id bigint,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists restorations_user_unlocked_idx
  on public.restorations(user_id, unlocked_at);

create index if not exists credit_transactions_user_created_idx
  on public.credit_transactions(user_id, created_at desc);

create unique index if not exists credit_transactions_purchase_description_uidx
  on public.credit_transactions(description)
  where type = 'purchase' and description is not null;

alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "Users can read own credit balance"
  on public.user_credits;

create policy "Users can read own credit balance"
  on public.user_credits
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read own credit transactions"
  on public.credit_transactions;

create policy "Users can read own credit transactions"
  on public.credit_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.unlock_restoration_with_credit(
  p_restoration_id bigint,
  p_user_id uuid default auth.uid()
)
returns table (
  restoration_id bigint,
  credits_remaining integer,
  unlocked_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restoration public.restorations%rowtype;
  v_balance integer;
  v_unlocked_at timestamptz;
begin
  if p_user_id is null then
    raise exception 'unauthorized';
  end if;

  select *
    into v_restoration
    from public.restorations
    where id = p_restoration_id
      and user_id::uuid = p_user_id
    for update;

  if not found then
    raise exception 'restoration_not_found';
  end if;

  if v_restoration.unlocked_at is not null then
    select coalesce(balance, 0)
      into v_balance
      from public.user_credits
      where user_id = p_user_id;

    restoration_id := v_restoration.id;
    credits_remaining := coalesce(v_balance, 0);
    unlocked_at := v_restoration.unlocked_at;
    return next;
    return;
  end if;

  select balance
    into v_balance
    from public.user_credits
    where user_id = p_user_id
    for update;

  if coalesce(v_balance, 0) < 1 then
    raise exception 'insufficient_credits';
  end if;

  v_unlocked_at := now();

  update public.user_credits
    set balance = balance - 1,
        updated_at = now()
    where user_id = p_user_id
    returning balance into v_balance;

  update public.restorations
    set unlocked_at = v_unlocked_at
    where id = p_restoration_id;

  insert into public.credit_transactions (
    user_id,
    amount,
    type,
    restoration_id,
    description
  )
  values (
    p_user_id,
    -1,
    'unlock',
    p_restoration_id,
    'Déblocage photo sans filigrane'
  );

  restoration_id := p_restoration_id;
  credits_remaining := v_balance;
  unlocked_at := v_unlocked_at;
  return next;
end;
$$;

grant execute on function public.unlock_restoration_with_credit(bigint, uuid)
  to authenticated;

create or replace function public.add_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_user_id is null or p_amount <= 0 or p_description is null then
    raise exception 'invalid_credit_purchase';
  end if;

  insert into public.credit_transactions (
    user_id,
    amount,
    type,
    description
  )
  values (
    p_user_id,
    p_amount,
    'purchase',
    p_description
  )
  on conflict (description)
  where type = 'purchase' and description is not null
  do nothing;

  if not found then
    select coalesce(balance, 0)
      into v_balance
      from public.user_credits
      where user_id = p_user_id;

    return coalesce(v_balance, 0);
  end if;

  insert into public.user_credits (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id)
  do update set balance = public.user_credits.balance + excluded.balance,
                updated_at = now()
  returning balance into v_balance;

  return v_balance;
end;
$$;

grant execute on function public.add_user_credits(uuid, integer, text)
  to service_role;

-- Optional test credit grant before Stripe is connected:
-- replace the UUID with the user id from Supabase Auth > Users.
--
-- insert into public.user_credits (user_id, balance)
-- values ('00000000-0000-0000-0000-000000000000', 5)
-- on conflict (user_id)
-- do update set balance = public.user_credits.balance + 5,
--               updated_at = now();
