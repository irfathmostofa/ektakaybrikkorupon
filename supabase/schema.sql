-- Complete database schema for Hope Foundation.
-- Run this in the Supabase SQL Editor on a new project.
-- Covers all dynamic CMS, i18n, donation, finance, membership, and career fields.
-- Safe to re-run. Additive ALTER statements upgrade older databases in place.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('super_admin', 'admin', 'editor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.cause_status as enum ('draft', 'active', 'completed', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.donation_status as enum ('pending', 'success', 'failed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.blog_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.about_section_type as enum (
    'story', 'mission', 'vision', 'values', 'timeline', 'custom'
  );
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
  create type public.employment_type as enum (
    'full_time', 'part_time', 'contract', 'volunteer'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.job_application_status as enum (
    'pending', 'reviewed', 'shortlisted', 'rejected'
  );
exception when duplicate_object then null;
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
-- Canonical copy is Bangla. *_en columns are the English overlay.
-- ---------------------------------------------------------------------------

create table if not exists public.causes_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  description text,
  description_en text,
  short_description text,
  short_description_en text,
  goal_amount numeric(12, 2) not null default 0 check (goal_amount >= 0),
  raised_amount numeric(12, 2) not null default 0 check (raised_amount >= 0),
  image_url text,
  status public.cause_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.causes_projects
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists short_description_en text;

create index if not exists causes_projects_status_idx on public.causes_projects (status);
create index if not exists causes_projects_slug_idx on public.causes_projects (slug);
create index if not exists causes_projects_featured_idx on public.causes_projects (featured, created_at desc);

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
  donor_phone text,
  donor_address text,
  message text,
  locale text not null default 'bn' check (locale in ('bn', 'en')),
  amount numeric(12, 2) not null check (amount > 0),
  transaction_id text unique,
  cause_id uuid references public.causes_projects (id) on delete set null,
  status public.donation_status not null default 'pending',
  payment_method text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.donations
  add column if not exists donor_phone text,
  add column if not exists donor_address text,
  add column if not exists message text,
  add column if not exists locale text default 'bn';

create index if not exists donations_cause_id_idx on public.donations (cause_id);
create index if not exists donations_status_idx on public.donations (status);
create index if not exists donations_transaction_id_idx on public.donations (transaction_id);
create index if not exists donations_locale_idx on public.donations (locale);

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
  title_en text,
  slug text not null unique,
  excerpt text,
  excerpt_en text,
  content text,
  content_en text,
  cover_image_url text,
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.blog_posts
  add column if not exists title_en text,
  add column if not exists excerpt_en text,
  add column if not exists content_en text,
  add column if not exists view_count integer not null default 0;

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_post_categories (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  category_id uuid not null references public.blog_categories (id) on delete cascade,
  primary key (post_id, category_id)
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists blog_categories_slug_idx on public.blog_categories (slug);
create index if not exists blog_tags_slug_idx on public.blog_tags (slug);

create or replace function public.increment_blog_view(post_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.blog_posts
  set view_count = coalesce(view_count, 0) + 1
  where slug = post_slug
    and status = 'published';
end;
$$;

grant execute on function public.increment_blog_view(text) to anon, authenticated;

create or replace function public.increment_site_visitors()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_settings
  set visitor_count = coalesce(visitor_count, 0) + 1
  where id = 1;
end;
$$;

grant execute on function public.increment_site_visitors() to anon, authenticated;

create index if not exists blog_posts_status_idx on public.blog_posts (status);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- page_content (CMS rows for every public page)
-- Seed keys: home, about, contact, gallery, achievements, transparency,
-- membership, careers.
-- ---------------------------------------------------------------------------

create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  title_en text,
  subtitle text,
  subtitle_en text,
  body text,
  body_en text,
  hero_image_url text,
  meta_title text,
  meta_title_en text,
  meta_description text,
  meta_description_en text,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.page_content
  add column if not exists title_en text,
  add column if not exists subtitle_en text,
  add column if not exists body_en text,
  add column if not exists meta_title_en text,
  add column if not exists meta_description_en text;

drop trigger if exists page_content_set_updated_at on public.page_content;
create trigger page_content_set_updated_at
before update on public.page_content
for each row execute function public.set_updated_at();

insert into public.page_content (
  page_key, title, title_en, subtitle, subtitle_en, body, body_en,
  meta_title, meta_title_en, meta_description, meta_description_en
)
values
  (
    'home',
    '১টাকায় সবুজের বিপ্লব! প্রতিদিন এক টাকা, মাসে একটি গাছ।',
    'A green revolution for 1 taka! One taka a day, one tree a month.',
    'আসুন, প্রতিদিন মাত্র ১ টাকা সঞ্চয় করে আমরা গড়ে তুলি সবুজ বাংলাদেশ।',
    'Let us save just 1 taka a day and grow a greener Bangladesh.',
    'শুধু গাছ লাগানো নয়, আমরা গড়ছি ভবিষ্যৎ।',
    'We are not only planting trees—we are building the future.',
    '১টাকায় বৃক্ষরোপণ',
    '1 Taka Tree Plantation',
    'প্রতিদিন এক টাকা, মাসে একটি গাছ। ২০১৯ সাল থেকে পরিবেশ ও মানবতার সেবায় নিয়োজিত।',
    'One taka a day, one tree a month. Serving the environment and humanity since 2019.'
  ),
  (
    'about',
    'যে ভাবনা থেকে আমাদের যাত্রা',
    'The idea that started our journey',
    '১টাকায় বৃক্ষরোপণ — পরিবেশবাদী ও স্বেচ্ছাসেবী সংগঠন।',
    '1 Taka Tree Plantation — an environmental volunteer organization.',
    'লক্ষ্য, দৃষ্টি, মূল্যবোধ ও দল—সবই সম্পাদকীয় কন্টেন্ট থেকে।',
    'Mission, vision, values, and team assembled from the CMS.',
    'আমাদের কথা',
    'About',
    'লক্ষ্য, দৃষ্টি, মূল্যবোধ ও দল—সবই সম্পাদকীয় কন্টেন্ট থেকে।',
    'Mission, vision, values, and team assembled from the CMS.'
  ),
  (
    'contact',
    'আমাদের খুঁজুন',
    'Find us',
    'অংশীদারিত্ব, স্বেচ্ছাসেবা বা মাঠ সফর—লিখুন।',
    'Partnerships, volunteering, or a field visit—write to us.',
    'সকালের কুয়াশার মতো শান্ত উত্তর পাবেন।',
    'You will hear back calmly. Even when we are in the field, messages are not lost.',
    'যোগাযোগ',
    'Contact',
    '১টাকায় বৃক্ষরোপণের সাথে যোগাযোগ করুন।',
    'Get in touch with 1 Taka Tree Plantation.'
  ),
  (
    'gallery',
    'মাঠের আলো',
    'Light from the field',
    'অ্যালবাম খুলুন। প্রতিটি ছবি একটি আবাস।',
    'Open an album. Every photograph is a habitat.',
    'আমরা স্টক ছবি নয়, মাঠের নোট রাখি।',
    'These are field notes, not stock photos.',
    'ছবিঘর',
    'Gallery',
    'সংরক্ষণের অ্যালবাম ও লাইটবক্স।',
    'Conservation albums and lightbox viewing.'
  ),
  (
    'achievements',
    'যা বেড়েছে, যা ফিরেছে',
    'What has grown, what has returned',
    'মাইলফলক নয়, জীবন্ত হিসাব।',
    'Not trophies—living accounts of impact.',
    'গাছ, আবাস, মানুষ—প্রতিটি সংখ্যার পেছনে মাঠ আছে।',
    'Trees, habitat, people—every number has a field behind it.',
    'অর্জন',
    'Achievements',
    'প্রভাবের মাইলফলক ও তারিখ।',
    'Impact milestones and dates.'
  ),
  (
    'transparency',
    'খোলা খাতা',
    'An open ledger',
    'সংগ্রহ সবুজ, ব্যয় মাটির রঙে।',
    'Collections in leaf green, expenses in soil.',
    'প্রকাশিত হিসাবই দেখবেন। খসড়া কখনো সামনে আসে না।',
    'Only published entries appear. Drafts never reach the public.',
    'স্বচ্ছতা',
    'Transparency',
    'সংগ্রহ ও ব্যয়ের প্রকাশিত ইতিহাস।',
    'Published collection and expense history.'
  ),
  (
    'membership',
    'শিকড় গাড়ুন',
    'Put down roots',
    'সদস্য হওয়া মানে একবার দান নয়, স্থায়ী অঙ্গীকার।',
    'Membership is not a one-time gift. It is a long allegiance.',
    'চাঁদায় চারা, প্রহরা ও শিক্ষা চলে। অনুমোদন ম্যানুয়াল।',
    'Fees grow saplings, patrols, and education. Approval is manual.',
    'সদস্যপদ',
    'Membership',
    'সদস্য পরিকল্পনা ও আবেদন।',
    'Membership plans and application.'
  ),
  (
    'careers',
    'মাঠে জায়গা আছে',
    'There is room in the field',
    'গবেষণা, প্রহরা, শিক্ষা—যেখানে হাত লাগে।',
    'Research, patrol, education—where hands are needed.',
    'আমরা সিটি অফিসের চেয়ে নদীর ধারে বেশি সময় কাটাই।',
    'We spend more time on riverbanks than in city offices.',
    'কর্মসংস্থান',
    'Careers',
    'খালি পদ ও আবেদন।',
    'Open roles and applications.'
  ),
  (
    'magazines',
    'মাঠের পত্রিকা',
    'Field journals',
    'প্রতিটি সংখ্যা অনলাইনে পড়ুন, অথবা পিডিএফ নামিয়ে রাখুন।',
    'Read every issue online, or download the PDF to keep.',
    'আমাদের ম্যাগাজিন মাঠের গল্প, অর্জন ও শিক্ষা একসাথে রাখে।',
    'Our magazines keep field stories, impact, and learning in one place.',
    'ম্যাগাজিন',
    'Magazines',
    'অনলাইনে পড়ুন ও পিডিএফ ডাউনলোড করুন।',
    'Read online and download the PDF.'
  )
on conflict (page_key) do nothing;

-- ---------------------------------------------------------------------------
-- site_settings (single-row configuration)
-- Secrets stay on this table. Public visitors read site_settings_public.
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  logo_url text,
  foundation_name text not null default '১টাকায় বৃক্ষরোপণ',
  foundation_name_en text,
  contact_email text,
  contact_phone text,
  address text,
  address_en text,
  social_links jsonb not null default '{}'::jsonb,
  default_locale text not null default 'bn' check (default_locale in ('bn', 'en')),
  sslcommerz_store_id text,
  sslcommerz_store_password text,
  sslcommerz_is_live boolean not null default false,
  emailjs_service_id text,
  emailjs_template_id text,
  emailjs_public_key text,
  emailjs_private_key text,
  google_site_verification_code text,
  meta_title text,
  meta_title_en text,
  meta_description text,
  meta_description_en text,
  favicon_url text,
  visitor_count integer not null default 0,
  visibility jsonb not null default '{
    "about": true,
    "causes": true,
    "gallery": true,
    "achievements": true,
    "transparency": true,
    "membership": true,
    "careers": false,
    "blog": true,
    "contact": true,
    "magazines": true
  }'::jsonb,
  theme jsonb not null default '{
    "primary": "oklch(0.48 0.12 145)",
    "secondary": "oklch(0.9 0.04 145)",
    "heading_font": "Fraunces",
    "body_font": "Source Sans 3",
    "mode": "light"
  }'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_settings
  add column if not exists foundation_name_en text,
  add column if not exists address_en text,
  add column if not exists default_locale text default 'bn',
  add column if not exists meta_title_en text,
  add column if not exists meta_description_en text,
  add column if not exists favicon_url text,
  add column if not exists visitor_count integer not null default 0,
  add column if not exists visibility jsonb,
  add column if not exists theme jsonb;

update public.site_settings
set
  visibility = coalesce(visibility, '{
    "about": true,
    "causes": true,
    "gallery": true,
    "achievements": true,
    "transparency": true,
    "membership": true,
    "careers": false,
    "blog": true,
    "contact": true,
    "magazines": true
  }'::jsonb),
  theme = coalesce(theme, '{
    "primary": "oklch(0.48 0.12 145)",
    "secondary": "oklch(0.9 0.04 145)",
    "heading_font": "Fraunces",
    "body_font": "Source Sans 3",
    "mode": "light"
  }'::jsonb)
where id = 1;

update public.site_settings
set visibility = coalesce(visibility, '{}'::jsonb) || '{"magazines": true}'::jsonb
where id = 1
  and (visibility is null or not (visibility ? 'magazines'));

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

insert into public.site_settings (
  id,
  foundation_name,
  foundation_name_en,
  default_locale,
  meta_title,
  meta_title_en,
  meta_description,
  meta_description_en
)
values (
  1,
  '১টাকায় বৃক্ষরোপণ',
  '1 Taka Tree Plantation',
  'bn',
  '১টাকায় বৃক্ষরোপণ',
  '1 Taka Tree Plantation',
  'প্রতিদিন এক টাকা, মাসে একটি গাছ। ২০১৯ সাল থেকে পরিবেশ ও মানবতার সেবায় নিয়োজিত।',
  'One taka a day, one tree a month. Serving the environment and humanity since 2019.'
)
on conflict (id) do nothing;

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
  meta_description_en,
  favicon_url,
  visitor_count,
  visibility,
  theme
from public.site_settings
where id = 1;

alter view public.site_settings_public set (security_invoker = false);
grant select on public.site_settings_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- about_sections
-- ---------------------------------------------------------------------------

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

create index if not exists about_sections_published_idx
  on public.about_sections (is_published, sort_order);

drop trigger if exists about_sections_set_updated_at on public.about_sections;
create trigger about_sections_set_updated_at
before update on public.about_sections
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------

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

create index if not exists team_members_published_idx
  on public.team_members (is_published, sort_order);

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- gallery_albums / gallery_images
-- ---------------------------------------------------------------------------

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

create index if not exists gallery_albums_published_idx
  on public.gallery_albums (is_published, sort_order);

drop trigger if exists gallery_albums_set_updated_at on public.gallery_albums;
create trigger gallery_albums_set_updated_at
before update on public.gallery_albums
for each row execute function public.set_updated_at();

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

create index if not exists gallery_images_album_idx
  on public.gallery_images (album_id, sort_order);

-- ---------------------------------------------------------------------------
-- magazines
-- ---------------------------------------------------------------------------

create table if not exists public.magazines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  description text,
  description_en text,
  cover_image_url text,
  pdf_url text not null,
  issue_date date,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists magazines_published_idx
  on public.magazines (is_published, sort_order, issue_date desc);

drop trigger if exists magazines_set_updated_at on public.magazines;
create trigger magazines_set_updated_at
before update on public.magazines
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------------

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

create index if not exists achievements_published_idx
  on public.achievements (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- finance_categories / finance_entries
-- ---------------------------------------------------------------------------

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  kind public.finance_kind not null,
  is_active boolean not null default true
);

create index if not exists finance_categories_kind_idx
  on public.finance_categories (kind, is_active);

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
  is_published boolean not null default false,
  transaction_id text
);

alter table public.finance_entries
  add column if not exists transaction_id text;

create unique index if not exists finance_entries_transaction_id_key
  on public.finance_entries (transaction_id)
  where transaction_id is not null;

create index if not exists finance_entries_published_idx
  on public.finance_entries (is_published, kind, entry_date desc);

-- ---------------------------------------------------------------------------
-- membership_plans / membership_applications
-- ---------------------------------------------------------------------------

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  description text,
  description_en text,
  fee_amount numeric(12, 2) not null default 0 check (fee_amount >= 0),
  duration_label text,
  duration_label_en text,
  benefits text,
  benefits_en text,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create index if not exists membership_plans_active_idx
  on public.membership_plans (is_active, sort_order);

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
  locale text default 'bn' check (locale in ('bn', 'en')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists membership_applications_status_idx
  on public.membership_applications (status, created_at desc);

-- ---------------------------------------------------------------------------
-- job_postings / job_applications
-- ---------------------------------------------------------------------------

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

create index if not exists job_postings_published_idx
  on public.job_postings (is_published, deadline);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  cover_letter text,
  resume_url text,
  status public.job_application_status not null default 'pending',
  locale text default 'bn' check (locale in ('bn', 'en')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists job_applications_job_idx
  on public.job_applications (job_id, status, created_at desc);

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
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_categories enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.page_content enable row level security;
alter table public.site_settings enable row level security;
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
alter table public.magazines enable row level security;

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

-- donations: public may insert pending rows; staff read; admins update.
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

drop policy if exists "donations_admin_delete" on public.donations;
create policy "donations_admin_delete"
on public.donations for delete
to authenticated
using (public.is_admin());

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

drop policy if exists "blog_categories_public_read" on public.blog_categories;
create policy "blog_categories_public_read"
on public.blog_categories for select
to anon, authenticated
using (true);

drop policy if exists "blog_categories_staff_write" on public.blog_categories;
create policy "blog_categories_staff_write"
on public.blog_categories for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "blog_tags_public_read" on public.blog_tags;
create policy "blog_tags_public_read"
on public.blog_tags for select
to anon, authenticated
using (true);

drop policy if exists "blog_tags_staff_write" on public.blog_tags;
create policy "blog_tags_staff_write"
on public.blog_tags for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "blog_post_categories_public_read" on public.blog_post_categories;
create policy "blog_post_categories_public_read"
on public.blog_post_categories for select
to anon, authenticated
using (true);

drop policy if exists "blog_post_categories_staff_write" on public.blog_post_categories;
create policy "blog_post_categories_staff_write"
on public.blog_post_categories for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "blog_post_tags_public_read" on public.blog_post_tags;
create policy "blog_post_tags_public_read"
on public.blog_post_tags for select
to anon, authenticated
using (true);

drop policy if exists "blog_post_tags_staff_write" on public.blog_post_tags;
create policy "blog_post_tags_staff_write"
on public.blog_post_tags for all
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

-- about_sections
drop policy if exists "about_public_read" on public.about_sections;
create policy "about_public_read"
on public.about_sections for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "about_staff_write" on public.about_sections;
create policy "about_staff_write"
on public.about_sections for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- team_members
drop policy if exists "team_public_read" on public.team_members;
create policy "team_public_read"
on public.team_members for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "team_staff_write" on public.team_members;
create policy "team_staff_write"
on public.team_members for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- gallery_albums
drop policy if exists "albums_public_read" on public.gallery_albums;
create policy "albums_public_read"
on public.gallery_albums for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "albums_staff_write" on public.gallery_albums;
create policy "albums_staff_write"
on public.gallery_albums for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- gallery_images
drop policy if exists "images_public_read" on public.gallery_images;
create policy "images_public_read"
on public.gallery_images for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "images_staff_write" on public.gallery_images;
create policy "images_staff_write"
on public.gallery_images for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- achievements
drop policy if exists "achievements_public_read" on public.achievements;
create policy "achievements_public_read"
on public.achievements for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "achievements_staff_write" on public.achievements;
create policy "achievements_staff_write"
on public.achievements for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- finance_categories
drop policy if exists "finance_cat_public_read" on public.finance_categories;
create policy "finance_cat_public_read"
on public.finance_categories for select
to anon, authenticated
using (is_active = true or public.is_staff());

drop policy if exists "finance_cat_staff_write" on public.finance_categories;
create policy "finance_cat_staff_write"
on public.finance_categories for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- finance_entries: unpublished drafts never leak to the public.
drop policy if exists "finance_public_read" on public.finance_entries;
create policy "finance_public_read"
on public.finance_entries for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "finance_staff_write" on public.finance_entries;
create policy "finance_staff_write"
on public.finance_entries for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- membership_plans
drop policy if exists "plans_public_read" on public.membership_plans;
create policy "plans_public_read"
on public.membership_plans for select
to anon, authenticated
using (is_active = true or public.is_staff());

drop policy if exists "plans_staff_write" on public.membership_plans;
create policy "plans_staff_write"
on public.membership_plans for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- membership_applications: public insert pending only; PII is staff-only.
drop policy if exists "membership_public_insert" on public.membership_applications;
create policy "membership_public_insert"
on public.membership_applications for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "membership_staff_read" on public.membership_applications;
create policy "membership_staff_read"
on public.membership_applications for select
to authenticated
using (public.is_staff());

drop policy if exists "membership_admin_update" on public.membership_applications;
create policy "membership_admin_update"
on public.membership_applications for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- job_postings
drop policy if exists "jobs_public_read" on public.job_postings;
create policy "jobs_public_read"
on public.job_postings for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "jobs_staff_write" on public.job_postings;
create policy "jobs_staff_write"
on public.job_postings for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- job_applications: public insert pending only; applicant PII is staff-only.
drop policy if exists "job_apps_public_insert" on public.job_applications;
create policy "job_apps_public_insert"
on public.job_applications for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "job_apps_staff_read" on public.job_applications;
create policy "job_apps_staff_read"
on public.job_applications for select
to authenticated
using (public.is_staff());

drop policy if exists "job_apps_admin_update" on public.job_applications;
create policy "job_apps_admin_update"
on public.job_applications for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- magazines
drop policy if exists "magazines_public_read" on public.magazines;
create policy "magazines_public_read"
on public.magazines for select
to anon, authenticated
using (is_published = true or public.is_staff());

drop policy if exists "magazines_staff_write" on public.magazines;
create policy "magazines_staff_write"
on public.magazines for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage: media bucket (gallery, about/team, achievements, receipts, resumes)
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

-- Public resume uploads for career applications.
drop policy if exists "media_public_resume_insert" on storage.objects;
create policy "media_public_resume_insert"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = 'resumes'
);

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

-- After the first admin signs up, promote that user:
-- update public.users set role = 'super_admin' where email = 'you@example.com';
