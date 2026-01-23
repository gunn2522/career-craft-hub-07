-- Create storage bucket for mentor avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('mentor-avatars', 'mentor-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for mentor avatars
CREATE POLICY "Mentors can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mentor-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Mentors can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'mentor-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Mentors can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mentor-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'mentor-avatars');