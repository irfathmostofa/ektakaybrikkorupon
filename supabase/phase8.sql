-- Additive migration for existing databases.
-- Stores section-wise home page copy on page_content.sections.
-- Fresh installs can skip this and run schema.sql instead.
-- Safe to re-run.

alter table public.page_content
  add column if not exists sections jsonb not null default '{}'::jsonb;
