
-- Drop old policies that require auth
DROP POLICY IF EXISTS "Users can upload their own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own contracts" ON storage.objects;

-- Allow anonymous uploads to the anonymous/ folder
CREATE POLICY "Anyone can upload to anonymous folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contracts' AND (storage.foldername(name))[1] = 'anonymous');

-- Allow anonymous reads from the anonymous/ folder
CREATE POLICY "Anyone can read anonymous folder"
ON storage.objects FOR SELECT
USING (bucket_id = 'contracts' AND (storage.foldername(name))[1] = 'anonymous');
