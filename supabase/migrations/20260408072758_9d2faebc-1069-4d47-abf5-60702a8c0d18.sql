-- Drop existing overly permissive public policies
DROP POLICY IF EXISTS "Anyone can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read contracts" ON storage.objects;

-- Create auth-scoped policies
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can read contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');