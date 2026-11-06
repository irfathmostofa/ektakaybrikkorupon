-- Phase 4 additive schema. Safe to run after supabase/schema.sql.

do $$ begin
  create type public.about_section_type as enum ('story', 'mission', 'vision', 'values', 'timeline', 'custom');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.finance_kind as enum ('collection', 'expense');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.membership_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'volunteer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.job_application_status as enum ('pending', 'reviewed', 'shortlisted', 'rejected');
exception when duplicate_object then null;
end $$;

alter table public.site_settings
  add column if not exists foundation_name_en text,
  add column if not exists address_en text,
  add column if not exists default_locale text default 'bn',
  add column if not exists meta_title_en text,
  add column if not exists meta_description_en text;

alter table public.page_content
  add column if not exists title_en text,
  add column if not exists subtitle_en text,
  add column if not exists body_en text,
  add column if not exists meta_title_en text,
  add column if not exists meta_description_en text;

alter table public.causes_projects
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists short_description_en text;

alter table public.blog_posts
  add column if not exists title_en text,
  add column if not exists excerpt_en text,
  add column if not exists content_en text;

create or replace view public.site_settings_public as
select
  logo_url,
  foundation_name,
  foundation_name_en,
  contact_email,
  contact_phone,
  address,
  address_en,
  social_links,
  google_site_verification_code,
  meta_title,
  meta_title_en,
  meta_description,
  meta_description_en
from public.site_settings
where id = 1;

alter view public.site_settings_public set (security_invoker = false);
grant select on public.site_settings_public to anon, authenticated;

insert into public.page_content (page_key, title, title_en, subtitle, subtitle_en, body, body_en)
values
  ('gallery', 'মাঠের আলো', 'Light from the field', 'অ্যালবাম খুলুন।', 'Open an album.', 'মাঠের নোট।', 'Field notes.'),
  ('achievements', 'যা বেড়েছে', 'What has grown', 'জীবন্ত হিসাব।', 'Living accounts.', 'প্রতিটি সংখ্যার পেছনে মাঠ।', 'Every number has a field behind it.'),
  ('transparency', 'খোলা খাতা', 'An open ledger', 'সংগ্রহ সবুজ, ব্যয় মাটির রঙে।', 'Collections in leaf green, expenses in soil.', 'শুধু প্রকাশিত হিসাব।', 'Published entries only.'),
  ('membership', 'শিকড় গাড়ুন', 'Put down roots', 'স্থায়ী অঙ্গীকার।', 'A long allegiance.', 'আবেদন ম্যানুয়াল অনুমোদন।', 'Applications are reviewed by hand.'),
  ('careers', 'মাঠে জায়গা আছে', 'There is room in the field', 'গবেষণা, প্রহরা, শিক্ষা।', 'Research, patrol, education.', 'নদীর ধারে বেশি সময়।', 'More time on riverbanks.')
on conflict (page_key) do nothing;

create table if not exists public.about_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  section_type public.about_section_type not null default 'custom',
  body text,
  body_en text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  full_name_en text,
  role_title text not null,
  role_title_en text,
  bio text,
  bio_en text,
  photo_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  description text,
  description_en text,
  cover_image_url text,
  event_date date,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
  image_url text not null,
  caption text,
  caption_en text,
  alt_text text,
  alt_text_en text,
  sort_order integer not null default 0,
  is_published boolean not null default false
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  description text,
  description_en text,
  metric_value numeric,
  metric_label text,
  metric_label_en text,
  achieved_on date,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false
);

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  kind public.finance_kind not null,
  is_active boolean not null default true
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  kind public.finance_kind not null,
  category_id uuid references public.finance_categories (id) on delete set null,
  title text not null,
  title_en text,
  description text,
  description_en text,
  amount numeric(12, 2) not null check (amount >= 0),
  entry_date date not null,
  source_or_payee text,
  receipt_url text,
  is_published boolean not null default false
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  description text,
  description_en text,
  fee_amount numeric(12, 2) not null default 0,
  duration_label text,
  duration_label_en text,
  benefits text,
  benefits_en text,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  address text,
  plan_id uuid references public.membership_plans (id) on delete set null,
  motivation text,
  status public.membership_status not null default 'pending',
  admin_notes text,
  locale text default 'bn',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  department text,
  department_en text,
  location text,
  location_en text,
  employment_type public.employment_type not null default 'full_time',
  description text,
  description_en text,
  requirements text,
  requirements_en text,
  deadline date,
  is_published boolean not null default false
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  cover_letter text,
  resume_url text,
  status public.job_application_status not null default 'pending',
  locale text default 'bn',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.about_sections enable row level security;
alter table public.team_members enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.achievements enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_entries enable row level security;
alter table public.membership_plans enable row level security;
alter table public.membership_applications enable row level security;
alter table public.job_postings enable row level security;
alter table public.job_applications enable row level security;

drop policy if exists "about_public_read" on public.about_sections;
create policy "about_public_read" on public.about_sections for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "about_staff_write" on public.about_sections;
create policy "about_staff_write" on public.about_sections for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "team_public_read" on public.team_members;
create policy "team_public_read" on public.team_members for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "team_staff_write" on public.team_members;
create policy "team_staff_write" on public.team_members for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "albums_public_read" on public.gallery_albums;
create policy "albums_public_read" on public.gallery_albums for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "albums_staff_write" on public.gallery_albums;
create policy "albums_staff_write" on public.gallery_albums for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "images_public_read" on public.gallery_images;
create policy "images_public_read" on public.gallery_images for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "images_staff_write" on public.gallery_images;
create policy "images_staff_write" on public.gallery_images for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "achievements_public_read" on public.achievements;
create policy "achievements_public_read" on public.achievements for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "achievements_staff_write" on public.achievements;
create policy "achievements_staff_write" on public.achievements for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "finance_cat_public_read" on public.finance_categories;
create policy "finance_cat_public_read" on public.finance_categories for select to anon, authenticated
using (is_active = true or public.is_staff());
drop policy if exists "finance_cat_staff_write" on public.finance_categories;
create policy "finance_cat_staff_write" on public.finance_categories for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "finance_public_read" on public.finance_entries;
create policy "finance_public_read" on public.finance_entries for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "finance_staff_write" on public.finance_entries;
create policy "finance_staff_write" on public.finance_entries for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "plans_public_read" on public.membership_plans;
create policy "plans_public_read" on public.membership_plans for select to anon, authenticated
using (is_active = true or public.is_staff());
drop policy if exists "plans_staff_write" on public.membership_plans;
create policy "plans_staff_write" on public.membership_plans for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "membership_public_insert" on public.membership_applications;
create policy "membership_public_insert" on public.membership_applications for insert to anon, authenticated
with check (status = 'pending');
drop policy if exists "membership_staff_read" on public.membership_applications;
create policy "membership_staff_read" on public.membership_applications for select to authenticated
using (public.is_staff());
drop policy if exists "membership_admin_update" on public.membership_applications;
create policy "membership_admin_update" on public.membership_applications for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "jobs_public_read" on public.job_postings;
create policy "jobs_public_read" on public.job_postings for select to anon, authenticated
using (is_published = true or public.is_staff());
drop policy if exists "jobs_staff_write" on public.job_postings;
create policy "jobs_staff_write" on public.job_postings for all to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "job_apps_public_insert" on public.job_applications;
create policy "job_apps_public_insert" on public.job_applications for insert to anon, authenticated
with check (status = 'pending');
drop policy if exists "job_apps_staff_read" on public.job_applications;
create policy "job_apps_staff_read" on public.job_applications for select to authenticated
using (public.is_staff());
drop policy if exists "job_apps_admin_update" on public.job_applications;
create policy "job_apps_admin_update" on public.job_applications for update to authenticated
using (public.is_admin()) with check (public.is_admin());
