-- Legacy additive file. Donation extra fields and the finance transaction
-- unique index now live in supabase/schema.sql. Keep this file only for
-- databases that already ran the original Phase 2 + Phase 4 schema.
-- Safe to skip on a fresh install.

alter table public.donations
  add column if not exists donor_phone text,
  add column if not exists donor_address text,
  add column if not exists message text,
  add column if not exists locale text default 'bn';

alter table public.finance_entries
  add column if not exists transaction_id text;

create unique index if not exists finance_entries_transaction_id_key
  on public.finance_entries (transaction_id)
  where transaction_id is not null;
