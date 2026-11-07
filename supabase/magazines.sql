-- Additive migration for existing databases.
-- Creates magazines CMS, page copy, visibility, and RLS.
-- Fresh installs can skip this and run schema.sql instead.
-- Safe to re-run.

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

alter table public.magazines enable row level security;

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

insert into public.page_content (
  page_key, title, title_en, subtitle, subtitle_en, body, body_en,
  meta_title, meta_title_en, meta_description, meta_description_en
)
values (
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

alter table public.site_settings
  add column if not exists visibility jsonb;

update public.site_settings
set visibility = coalesce(visibility, '{}'::jsonb) || '{"magazines": true}'::jsonb
where id = 1
  and (visibility is null or not (visibility ? 'magazines'));
