create extension if not exists "pgcrypto";

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_name text,
  owner_email text,
  owner_phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text,
  phone text,
  email text,
  service_requested text,
  status text not null default 'New' check (status in ('New','Qualified','Booked','Lost')),
  notes text,
  last_message text,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  channel text not null default 'sms' check (channel in ('sms','call')),
  from_number text,
  to_number text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_account_id_idx on public.leads (account_id);
create index if not exists messages_lead_id_idx on public.messages (lead_id);
create index if not exists messages_account_id_idx on public.messages (account_id);

alter table public.accounts enable row level security;
alter table public.user_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;

create policy "accounts_select_own"
on public.accounts for select to authenticated
using (
  id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
);

create policy "profiles_select_own"
on public.user_profiles for select to authenticated
using (id = auth.uid());

create policy "leads_select_own_account"
on public.leads for select to authenticated
using (
  account_id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
);

create policy "leads_update_own_account"
on public.leads for update to authenticated
using (
  account_id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
)
with check (
  account_id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
);

create policy "leads_insert_own_account"
on public.leads for insert to authenticated
with check (
  account_id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
);

create policy "messages_select_own_account"
on public.messages for select to authenticated
using (
  account_id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
);

create policy "messages_insert_own_account"
on public.messages for insert to authenticated
with check (
  account_id = (select up.account_id from public.user_profiles up where up.id = auth.uid())
);

create or replace function public.admin_create_account_for_user(
  p_user_id uuid,
  p_business_name text,
  p_owner_name text,
  p_owner_email text,
  p_owner_phone text,
  p_role text default 'owner'
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_account_id uuid;
begin
  insert into public.accounts (business_name, owner_name, owner_email, owner_phone)
  values (p_business_name, p_owner_name, p_owner_email, p_owner_phone)
  returning id into new_account_id;

  insert into public.user_profiles (id, account_id, role)
  values (p_user_id, new_account_id, p_role);

  return new_account_id;
end;
$$;

revoke all on function public.admin_create_account_for_user(uuid,text,text,text,text,text) from public;
