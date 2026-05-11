ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'self_review';
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'finance_review';
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'legal_review';
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'head_approval';

ALTER TABLE public.contract_approvals ADD COLUMN IF NOT EXISTS stage text;