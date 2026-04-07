-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contracts', 'contracts', false, 20971520)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload contracts
CREATE POLICY "Anyone can upload contracts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contracts');

-- Allow anyone to read contracts
CREATE POLICY "Anyone can read contracts"
ON storage.objects FOR SELECT
USING (bucket_id = 'contracts');