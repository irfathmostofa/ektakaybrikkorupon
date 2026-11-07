-- Additive migration for existing databases.
-- Creates blog categories/tags (and join tables) if they are missing.
-- Fresh installs can skip this and run schema.sql instead.
-- Safe to re-run.

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

alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_categories enable row level security;
alter table public.blog_post_tags enable row level security;

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

notify pgrst, 'reload schema';
