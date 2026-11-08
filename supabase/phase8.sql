-- Additive migration for existing databases.
-- Stores section-wise home page copy on page_content.sections.
-- Brings older site_settings tables up to date, then refreshes the public view.
-- Fresh installs can skip this and run schema.sql instead.
-- Safe to re-run.

alter table public.page_content
  add column if not exists sections jsonb not null default '{}'::jsonb;

alter table public.site_settings
  add column if not exists foundation_name_en text,
  add column if not exists address_en text,
  add column if not exists default_locale text default 'bn',
  add column if not exists meta_title_en text,
  add column if not exists meta_description_en text,
  add column if not exists favicon_url text,
  add column if not exists og_image_url text,
  add column if not exists visitor_count integer not null default 0,
  add column if not exists visibility jsonb,
  add column if not exists theme jsonb,
  add column if not exists role_menus jsonb not null default '{}'::jsonb;

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

drop view if exists public.site_settings_public;

create view public.site_settings_public as
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
  og_image_url,
  visitor_count,
  visibility,
  theme
from public.site_settings
where id = 1;

alter view public.site_settings_public set (security_invoker = false);
grant select on public.site_settings_public to anon, authenticated;

notify pgrst, 'reload schema';
