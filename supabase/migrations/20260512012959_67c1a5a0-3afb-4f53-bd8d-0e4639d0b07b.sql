
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS department_name text,
  ADD COLUMN IF NOT EXISTS contract_type text,
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS party_a_name text,
  ADD COLUMN IF NOT EXISTS party_b_name text,
  ADD COLUMN IF NOT EXISTS counterparty_contact_name text,
  ADD COLUMN IF NOT EXISTS counterparty_contact_phone text,
  ADD COLUMN IF NOT EXISTS our_bank_account text,
  ADD COLUMN IF NOT EXISTS counterparty_bank_account text;
