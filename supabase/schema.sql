-- Cartly tables for the new Supabase project.
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.user_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  id text not null unique,
  budget_limit numeric not null default 350000,
  sound_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.receipts (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  date_label text not null default '',
  budget_limit numeric not null default 0,
  grand_total numeric not null default 0,
  total_saved numeric not null default 0,
  item_count integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  payment_method text not null default '',
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table public.receipts add column if not exists payment_method text not null default '';

create table if not exists public.master_products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  unit text not null default '',
  last_price numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);

-- Profile details are synchronized from Supabase Auth so email/phone verification
-- status comes from the provider rather than from values typed into the app.
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_profiles_verified_phone_unique
  on public.user_profiles (phone)
  where phone_verified and phone is not null;

create or replace function public.sync_cartly_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (
    user_id,
    full_name,
    email,
    phone,
    email_verified,
    phone_verified,
    updated_at
  ) values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ),
    coalesce(new.email, nullif(new.raw_user_meta_data ->> 'email', '')),
    case when new.phone_confirmed_at is not null then new.phone else null end,
    new.email_confirmed_at is not null,
    new.phone_confirmed_at is not null,
    now()
  )
  on conflict (user_id) do update set
    full_name = coalesce(nullif(excluded.full_name, ''), public.user_profiles.full_name),
    email = excluded.email,
    phone = case when excluded.phone_verified then excluded.phone else null end,
    email_verified = excluded.email_verified,
    phone_verified = excluded.phone_verified,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists cartly_sync_user_profile on auth.users;
create trigger cartly_sync_user_profile
  after insert or update of email, phone, raw_user_meta_data, email_confirmed_at, phone_confirmed_at
  on auth.users
  for each row execute function public.sync_cartly_user_profile();

insert into public.user_profiles (user_id, full_name, email, phone, email_verified, phone_verified)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'full_name', ''),
    nullif(raw_user_meta_data ->> 'display_name', ''),
    nullif(raw_user_meta_data ->> 'name', ''),
    ''
  ),
  coalesce(email, nullif(raw_user_meta_data ->> 'email', '')),
  case when phone_confirmed_at is not null then phone else null end,
  email_confirmed_at is not null,
  phone_confirmed_at is not null
from auth.users
on conflict (user_id) do nothing;

alter table public.user_settings enable row level security;
alter table public.receipts enable row level security;
alter table public.master_products enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "Cartly users manage their settings" on public.user_settings;
create policy "Cartly users manage their settings"
  on public.user_settings for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Cartly users manage their receipts" on public.receipts;
create policy "Cartly users manage their receipts"
  on public.receipts for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Cartly users manage their products" on public.master_products;
create policy "Cartly users manage their products"
  on public.master_products for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Cartly users read their own profile" on public.user_profiles;
create policy "Cartly users read their own profile"
  on public.user_profiles for select to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update, delete on public.receipts to authenticated;
grant select, insert, update, delete on public.master_products to authenticated;
revoke all on public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;
