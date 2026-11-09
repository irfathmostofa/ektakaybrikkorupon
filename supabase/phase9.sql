-- Additive migration for existing databases.
-- Enforces one membership application per email (case-insensitive).
-- Fresh installs can skip this and run schema.sql instead.
-- Safe to re-run.
-- If this unique index fails, duplicate emails already exist and must be
-- resolved before the index can be created. Application-level checks still apply.

create unique index if not exists membership_applications_email_lower_idx
  on public.membership_applications (lower(email));
