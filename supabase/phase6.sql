-- Additive migration for existing databases.
-- Adds donation packages, role menu access, email subscribers/campaigns,
-- and related RLS. Fresh installs can skip this and run schema.sql instead.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- donations: admin delete
-- ---------------------------------------------------------------------------

drop policy if exists "donations_admin_delete" on public.donations;
create policy "donations_admin_delete"
on public.donations for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- donation_packages
-- ---------------------------------------------------------------------------

create table if not exists public.donation_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  description_en text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists donation_packages_set_updated_at on public.donation_packages;
create trigger donation_packages_set_updated_at
before update on public.donation_packages
for each row execute function public.set_updated_at();

create index if not exists donation_packages_active_idx
  on public.donation_packages (is_active, sort_order);

alter table public.donations
  add column if not exists package_id uuid references public.donation_packages (id) on delete set null;

create index if not exists donations_package_id_idx on public.donations (package_id);

insert into public.donation_packages (name, name_en, amount, description, description_en, sort_order)
select * from (values
  ('৩০ টাকা', '30 Taka', 30::numeric, 'এক মাসের এক টাকা করে সঞ্চয়', 'One taka a day for a month', 1),
  ('৯০ টাকা', '90 Taka', 90::numeric, 'তিন মাসের সঞ্চয়', 'Three months of saving', 2),
  ('১৮০ টাকা', '180 Taka', 180::numeric, 'ছয় মাসের সঞ্চয়', 'Six months of saving', 3),
  ('৩৬০ টাকা', '360 Taka', 360::numeric, 'এক বছরের সঞ্চয়', 'A year of saving', 4),
  ('১০০০ টাকা', '1000 Taka', 1000::numeric, 'বড় অবদান', 'A larger gift', 5)
) as seed(name, name_en, amount, description, description_en, sort_order)
where not exists (select 1 from public.donation_packages);

-- ---------------------------------------------------------------------------
-- Role menu access (stored on site_settings)
-- ---------------------------------------------------------------------------

alter table public.site_settings
  add column if not exists role_menus jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- email_subscribers / email_campaigns
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.campaign_status as enum ('draft', 'sending', 'sent', 'partially_failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_audience as enum ('subscribers', 'members', 'both');
exception when duplicate_object then null;
end $$;

create table if not exists public.email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists email_subscribers_active_idx
  on public.email_subscribers (is_active, created_at desc);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body text not null default '',
  audience public.campaign_audience not null default 'subscribers',
  status public.campaign_status not null default 'draft',
  sent_at timestamptz,
  recipient_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists email_campaigns_set_updated_at on public.email_campaigns;
create trigger email_campaigns_set_updated_at
before update on public.email_campaigns
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Extra role helper
-- ---------------------------------------------------------------------------

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS for new tables and user admin writes
-- ---------------------------------------------------------------------------

alter table public.donation_packages enable row level security;
alter table public.email_subscribers enable row level security;
alter table public.email_campaigns enable row level security;

drop policy if exists "packages_public_read" on public.donation_packages;
create policy "packages_public_read"
on public.donation_packages for select
to anon, authenticated
using (is_active = true or public.is_staff());

drop policy if exists "packages_staff_write" on public.donation_packages;
create policy "packages_staff_write"
on public.donation_packages for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "subscribers_staff_all" on public.email_subscribers;
create policy "subscribers_staff_all"
on public.email_subscribers for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "campaigns_staff_all" on public.email_campaigns;
create policy "campaigns_staff_all"
on public.email_campaigns for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "users_admin_insert" on public.users;
create policy "users_admin_insert"
on public.users for insert
to authenticated
with check (public.is_admin());

drop policy if exists "users_admin_delete" on public.users;
create policy "users_admin_delete"
on public.users for delete
to authenticated
using (public.is_admin());
