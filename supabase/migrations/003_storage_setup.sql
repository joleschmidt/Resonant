-- RESONANT Storage Setup for Listing Images
-- Configure Supabase Storage for listing images with RLS policies

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- RLS Policies for listing-images bucket

-- Anyone can view images (public bucket)
CREATE POLICY "Listing images are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listing-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

-- Users can update their own images
CREATE POLICY "Users can update their own listing images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
CREATE POLICY "Users can delete their own listing images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Grant permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
