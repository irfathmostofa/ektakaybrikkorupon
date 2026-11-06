-- Phase 2: Database Schema & Row Level Security
-- Run this in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('super_admin', 'admin', 'editor');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.cause_status as enum ('draft', 'active', 'completed', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.donation_status as enum ('pending', 'success', 'failed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.blog_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Updated-at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'editor',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'editor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- causes_projects
-- ---------------------------------------------------------------------------

create table if not exists public.causes_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  goal_amount numeric(12, 2) not null default 0 check (goal_amount >= 0),
  raised_amount numeric(12, 2) not null default 0 check (raised_amount >= 0),
  image_url text,
  status public.cause_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists causes_projects_status_idx on public.causes_projects (status);
create index if not exists causes_projects_slug_idx on public.causes_projects (slug);

drop trigger if exists causes_projects_set_updated_at on public.causes_projects;
create trigger causes_projects_set_updated_at
before update on public.causes_projects
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- donations
-- ---------------------------------------------------------------------------

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null,
  donor_email text not null,
  amount numeric(12, 2) not null check (amount > 0),
  transaction_id text unique,
  cause_id uuid references public.causes_projects (id) on delete set null,
  status public.donation_status not null default 'pending',
  payment_method text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists donations_cause_id_idx on public.donations (cause_id);
create index if not exists donations_status_idx on public.donations (status);
create index if not exists donations_transaction_id_idx on public.donations (transaction_id);

drop trigger if exists donations_set_updated_at on public.donations;
create trigger donations_set_updated_at
before update on public.donations
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists blog_posts_status_idx on public.blog_posts (status);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- page_content (global public pages)
-- ---------------------------------------------------------------------------

create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  subtitle text,
  body text,
  hero_image_url text,
  meta_title text,
  meta_description text,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists page_content_set_updated_at on public.page_content;
create trigger page_content_set_updated_at
before update on public.page_content
for each row execute function public.set_updated_at();

insert into public.page_content (page_key, title, subtitle, body)
values
  (
    'home',
    'Hope starts here',
    'Support causes that change lives.',
    'We partner with communities to deliver education, healthcare, and emergency relief.'
  ),
  (
    'about',
    'About the foundation',
    'Our mission and values',
    'We are a non-profit foundation focused on transparent giving and measurable impact.'
  ),
  (
    'contact',
    'Contact us',
    'We would love to hear from you',
    'Reach the team for partnerships, volunteering, or media inquiries.'
  )
on conflict (page_key) do nothing;

-- ---------------------------------------------------------------------------
-- site_settings (single-row configuration)
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  logo_url text,
  foundation_name text not null default 'Hope Foundation',
  contact_email text,
  contact_phone text,
  address text,
  social_links jsonb not null default '{}'::jsonb,
  sslcommerz_store_id text,
  sslcommerz_store_password text,
  sslcommerz_is_live boolean not null default false,
  emailjs_service_id text,
  emailjs_template_id text,
  emailjs_public_key text,
  emailjs_private_key text,
  google_site_verification_code text,
  meta_title text,
  meta_description text,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

insert into public.site_settings (id, foundation_name, meta_title, meta_description)
values (
  1,
  'Hope Foundation',
  'Hope Foundation',
  'A professional foundation website for causes, donations, and community impact.'
)
on conflict (id) do nothing;

-- Public-safe view: never expose payment or email secrets.
-- security_invoker is off so anonymous visitors can read public fields
-- without gaining SELECT on secret columns in site_settings.
create or replace view public.site_settings_public as
select
  logo_url,
  foundation_name,
  contact_email,
  contact_phone,
  address,
  social_links,
  google_site_verification_code,
  meta_title,
  meta_description
from public.site_settings
where id = 1;

alter view public.site_settings_public set (security_invoker = false);
grant select on public.site_settings_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Role helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_staff()
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
      and role in ('super_admin', 'admin', 'editor')
  );
$$;

create or replace function public.is_admin()
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
      and role in ('super_admin', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.causes_projects enable row level security;
alter table public.donations enable row level security;
alter table public.blog_posts enable row level security;
alter table public.page_content enable row level security;
alter table public.site_settings enable row level security;

-- users
drop policy if exists "users_select_own_or_staff" on public.users;
create policy "users_select_own_or_staff"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_staff());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "users_admin_update" on public.users;
create policy "users_admin_update"
on public.users for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- causes_projects
drop policy if exists "causes_public_read_active" on public.causes_projects;
create policy "causes_public_read_active"
on public.causes_projects for select
to anon, authenticated
using (status in ('active', 'completed') or public.is_staff());

drop policy if exists "causes_staff_write" on public.causes_projects;
create policy "causes_staff_write"
on public.causes_projects for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- donations
drop policy if exists "donations_staff_read" on public.donations;
create policy "donations_staff_read"
on public.donations for select
to authenticated
using (public.is_staff());

drop policy if exists "donations_insert_pending" on public.donations;
create policy "donations_insert_pending"
on public.donations for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "donations_admin_update" on public.donations;
create policy "donations_admin_update"
on public.donations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- blog_posts
drop policy if exists "blog_public_read_published" on public.blog_posts;
create policy "blog_public_read_published"
on public.blog_posts for select
to anon, authenticated
using (status = 'published' or public.is_staff());

drop policy if exists "blog_staff_write" on public.blog_posts;
create policy "blog_staff_write"
on public.blog_posts for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- page_content
drop policy if exists "page_content_public_read" on public.page_content;
create policy "page_content_public_read"
on public.page_content for select
to anon, authenticated
using (true);

drop policy if exists "page_content_staff_write" on public.page_content;
create policy "page_content_staff_write"
on public.page_content for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- site_settings: staff can read the full row; only admins can write secrets.
drop policy if exists "site_settings_staff_read" on public.site_settings;
create policy "site_settings_staff_read"
on public.site_settings for select
to authenticated
using (public.is_staff());

drop policy if exists "site_settings_admin_update" on public.site_settings;
create policy "site_settings_admin_update"
on public.site_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: media bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "media_staff_insert" on storage.objects;
create policy "media_staff_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media_staff_update" on storage.objects;
create policy "media_staff_update"
on storage.objects for update
to authenticated
using (bucket_id = 'media' and public.is_staff())
with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media_staff_delete" on storage.objects;
create policy "media_staff_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'media' and public.is_staff());

-- After the first admin signs up, promote that user:
-- update public.users set role = 'super_admin' where email = 'you@example.com';
