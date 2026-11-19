-- Cartly tables for the new Supabase project.
-- Run in Supabase Dashboard > SQL Editor to create or upgrade the schema.

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

-- Upgrade installations created from the former public/demo schema.
-- Old demo rows have no verified owner, so they remain inaccessible rather
-- than being copied into a random account.
alter table public.user_settings
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.receipts
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.master_products
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Keep an existing primary key intact for replication identity. Legacy tables
-- also get the composite unique key required by the application's upserts.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.receipts'::regclass
      and contype in ('p', 'u')
      and conkey = array[
        (select attnum::smallint from pg_attribute where attrelid = 'public.receipts'::regclass and attname = 'owner_id'),
        (select attnum::smallint from pg_attribute where attrelid = 'public.receipts'::regclass and attname = 'id')
      ]::smallint[]
  ) then
    execute 'create unique index if not exists receipts_owner_id_id_key on public.receipts (owner_id, id)';
  end if;
end;
$$;
create index if not exists receipts_owner_created_at_idx
  on public.receipts (owner_id, created_at desc);
alter table public.master_products drop constraint if exists master_products_name_key;
create unique index if not exists master_products_owner_id_name_key
  on public.master_products (owner_id, name);

-- Profile details are synchronized from Supabase Auth so email verification
-- status comes from the provider rather than from values typed into the app.
create table if not exists public.user_profiles (
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.user_profiles
  add column if not exists full_name text not null default '';
alter table public.user_profiles
  add column if not exists email text;
alter table public.user_profiles
  add column if not exists email_verified boolean not null default false;
alter table public.user_profiles
  add column if not exists created_at timestamptz not null default now();
alter table public.user_profiles
  add column if not exists updated_at timestamptz not null default now();

-- The previous demo profile table used a text `id` and a public policy.
-- Convert its shape without assigning unowned demo rows to a Cartly account.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'id'
  ) then
    execute 'alter table public.user_profiles drop constraint if exists user_profiles_pkey';
    execute 'alter table public.user_profiles alter column id drop default';
    execute 'alter table public.user_profiles alter column id drop not null';
    execute $migration$
      update public.user_profiles as profile
      set user_id = auth_user.id,
          full_name = coalesce(
            nullif(profile.full_name, ''),
            nullif(to_jsonb(profile) ->> 'name', ''),
            nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
            nullif(auth_user.raw_user_meta_data ->> 'display_name', ''),
            ''
          ),
          email = coalesce(auth_user.email, profile.email),
          email_verified = auth_user.email_confirmed_at is not null,
          updated_at = now()
      from auth.users as auth_user
      where profile.user_id is null
        and to_jsonb(profile) ->> 'id' = auth_user.id::text
    $migration$;
  end if;
end;
$$;

create unique index if not exists user_profiles_user_id_key
  on public.user_profiles (user_id);

drop index if exists public.user_profiles_verified_phone_unique;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.sync_cartly_user_profile()
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
    email_verified,
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
    new.email_confirmed_at is not null,
    now()
  )
  on conflict (user_id) do update set
    full_name = coalesce(nullif(excluded.full_name, ''), public.user_profiles.full_name),
    email = excluded.email,
    email_verified = excluded.email_verified,
    updated_at = now();

  return new;
end;
$$;

revoke all on function private.sync_cartly_user_profile() from public, anon, authenticated;

drop trigger if exists cartly_sync_user_profile on auth.users;
create trigger cartly_sync_user_profile
  after insert or update of email, raw_user_meta_data, email_confirmed_at
  on auth.users
  for each row execute function private.sync_cartly_user_profile();

drop function if exists public.sync_cartly_user_profile();

insert into public.user_profiles (user_id, full_name, email, email_verified)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'full_name', ''),
    nullif(raw_user_meta_data ->> 'display_name', ''),
    nullif(raw_user_meta_data ->> 'name', ''),
    ''
  ),
  coalesce(email, nullif(raw_user_meta_data ->> 'email', '')),
  email_confirmed_at is not null
from auth.users
on conflict (user_id) do nothing;

alter table public.user_settings enable row level security;
alter table public.receipts enable row level security;
alter table public.master_products enable row level security;
alter table public.user_profiles enable row level security;

-- Remove permissive policies left by the legacy database/schema.sql script.
drop policy if exists "Allow public all access on user_settings" on public.user_settings;
drop policy if exists "Allow public all access on receipts" on public.receipts;
drop policy if exists "Allow public all access on master_products" on public.master_products;

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

-- Lock down unused tables left by the earlier demo app while retaining their
-- data for a possible manual export.
do $$
declare
  legacy_table text;
begin
  foreach legacy_table in array array[
    'grocery_items', 'shopping_trips', 'price_benchmarks',
    'user_budget_settings', 'user_profiles'
  ] loop
    if to_regclass(format('public.%I', legacy_table)) is not null then
      execute format('alter table public.%I enable row level security', legacy_table);
      execute format('drop policy if exists %I on public.%I', 'Public full access for ' || legacy_table, legacy_table);
      execute format('revoke all on table public.%I from public, anon, authenticated', legacy_table);
    end if;
  end loop;
end;
$$;

grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update, delete on public.receipts to authenticated;
grant select, insert, update, delete on public.master_products to authenticated;
revoke all on public.user_settings from anon;
revoke all on public.receipts from anon;
revoke all on public.master_products from anon;
revoke all on public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;

-- Postgres Changes only emits rows from tables in this publication. Add the
-- three account-scoped tables so clients receive RLS-filtered realtime updates.
do $$
declare
  realtime_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach realtime_table in array array['receipts', 'master_products', 'user_settings'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = realtime_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', realtime_table);
      end if;
    end loop;
  else
    raise notice 'supabase_realtime publication is missing; enable it before relying on live sync.';
  end if;
end;
$$;
