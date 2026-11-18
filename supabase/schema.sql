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

alter table public.user_settings enable row level security;
alter table public.receipts enable row level security;
alter table public.master_products enable row level security;

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

grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update, delete on public.receipts to authenticated;
grant select, insert, update, delete on public.master_products to authenticated;
