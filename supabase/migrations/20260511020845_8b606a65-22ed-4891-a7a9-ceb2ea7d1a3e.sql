-- 1. review_rules 增加附件
ALTER TABLE public.review_rules
  ADD COLUMN IF NOT EXISTS attachment_path text,
  ADD COLUMN IF NOT EXISTS attachment_name text;

-- 2. profiles 增加访问权限级别
DO $$ BEGIN
  CREATE TYPE public.access_level AS ENUM ('read', 'download', 'modify');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS access_level public.access_level NOT NULL DEFAULT 'read';

-- 3. 规则附件存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('rule-attachments', 'rule-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 上传：认证用户上传到自己 user_id 命名的子目录
CREATE POLICY "rule-attachments upload own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rule-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 查看：自己的文件，或 admin/legal/finance 可看全部
CREATE POLICY "rule-attachments view"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'rule-attachments' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'legal')
    OR public.has_role(auth.uid(), 'finance')
  )
);

-- 删除：自己的文件或管理员
CREATE POLICY "rule-attachments delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'rule-attachments' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);