
-- ===== Contracts =====
CREATE TYPE public.contract_status AS ENUM ('draft','reviewing','revision_required','approved','sealed','archived');
CREATE TYPE public.approval_action AS ENUM ('approve','reject','comment');

CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_name text NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL,
  status public.contract_status NOT NULL DEFAULT 'draft',
  current_version int NOT NULL DEFAULT 1,
  company_name text,
  stance text,
  negotiation_position text,
  custom_rules text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contract_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  version int NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_by uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(contract_id, version)
);
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contract_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  version int NOT NULL,
  overall_score int,
  risk_summary jsonb,
  clauses jsonb,
  matched_rule_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contract_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  action public.approval_action NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_approvals ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contract_seals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_by uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_seals ENABLE ROW LEVEL SECURITY;

-- helper: 用户的部门
CREATE OR REPLACE FUNCTION public.get_user_department(_uid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT department_id FROM public.profiles WHERE user_id = _uid LIMIT 1
$$;

-- contracts policies
CREATE POLICY "view contracts (own dept or staff)" ON public.contracts FOR SELECT TO authenticated USING (
  uploaded_by = auth.uid()
  OR has_role(auth.uid(),'admin')
  OR has_role(auth.uid(),'legal')
  OR has_role(auth.uid(),'finance')
  OR (department_id IS NOT NULL AND department_id = public.get_user_department(auth.uid()))
);
CREATE POLICY "insert own contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "update contracts (owner/staff)" ON public.contracts FOR UPDATE TO authenticated USING (
  uploaded_by = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'legal') OR has_role(auth.uid(),'finance')
);
CREATE POLICY "delete contracts (admin)" ON public.contracts FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- versions
CREATE POLICY "view versions" ON public.contract_versions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id)
);
CREATE POLICY "insert versions" ON public.contract_versions FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- reviews
CREATE POLICY "view reviews" ON public.contract_reviews FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id)
);
CREATE POLICY "insert reviews (any auth)" ON public.contract_reviews FOR INSERT TO authenticated WITH CHECK (true);

-- approvals
CREATE POLICY "view approvals" ON public.contract_approvals FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id)
);
CREATE POLICY "insert approvals (legal/finance/admin)" ON public.contract_approvals FOR INSERT TO authenticated WITH CHECK (
  approver_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'legal') OR has_role(auth.uid(),'finance'))
);

-- seals
CREATE POLICY "view seals" ON public.contract_seals FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id)
);
CREATE POLICY "insert seals" ON public.contract_seals FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- updated_at trigger
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Storage =====
INSERT INTO storage.buckets (id,name,public) VALUES ('contract-scans','contract-scans',false)
ON CONFLICT (id) DO NOTHING;

-- contracts bucket policies for authenticated users
CREATE POLICY "auth upload contracts" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contracts');
CREATE POLICY "auth read contracts" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contracts');

CREATE POLICY "auth upload scans" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contract-scans');
CREATE POLICY "auth read scans" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contract-scans');
