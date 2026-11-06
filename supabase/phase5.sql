-- Phase 5 additive schema. Safe to run after supabase/schema.sql and supabase/phase4.sql.

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
