-- =====================================================
-- FIX 1: Protect Mentor Rejection Reasons
-- Create a public view excluding sensitive data
-- =====================================================

-- Create a public-safe view for mentor profiles
CREATE OR REPLACE VIEW public.public_mentor_profiles AS
SELECT 
  id,
  user_id,
  bio,
  expertise,
  specialization,
  years_of_experience,
  rating,
  students_mentored,
  sessions_conducted,
  is_featured,
  certifications,
  achievements,
  languages,
  linkedin_url,
  portfolio_url,
  featured_video_url,
  hourly_rate,
  consultation_rate,
  availability_status,
  verification_status,
  verified_at,
  -- Exclude: rejection_reason, verified_by, total_earnings, total_subscribers
  created_at,
  updated_at
FROM public.mentor_profiles
WHERE verification_status = 'verified';

-- Grant access to the view
GRANT SELECT ON public.public_mentor_profiles TO authenticated;
GRANT SELECT ON public.public_mentor_profiles TO anon;

-- Drop overly permissive SELECT policy on mentor_profiles
DROP POLICY IF EXISTS "Anyone can view mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Anyone can view verified mentor profiles" ON public.mentor_profiles;

-- Create restrictive RLS policies for mentor_profiles
-- Admins can see all mentor profiles including rejection reasons
CREATE POLICY "Admins can view all mentor profiles"
ON public.mentor_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can see their own mentor profile including rejection reason
CREATE POLICY "Users can view own mentor profile"
ON public.mentor_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Public can only see verified mentors (but should use view for no rejection_reason)
CREATE POLICY "Public can view verified mentor profiles"
ON public.mentor_profiles FOR SELECT
USING (verification_status = 'verified');

-- =====================================================
-- FIX 2: Secure Organization Logos Storage Bucket
-- Replace overly permissive policies with folder-based access
-- =====================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their organization logos" ON storage.objects;

-- Create folder-based access control for institutions
-- Files should be stored as: organization-logos/{user_id}/filename.ext
CREATE POLICY "Users can upload their own organization logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own organization logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own organization logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can manage all organization logos
CREATE POLICY "Admins can manage all organization logos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'organization-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- =====================================================
-- FIX 3: Secure Mentor Event Payment References
-- Create separate table for payment details with restricted access
-- =====================================================

-- Create secure payment details table
CREATE TABLE IF NOT EXISTS public.mentor_event_payment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID UNIQUE NOT NULL REFERENCES public.mentor_event_registrations(id) ON DELETE CASCADE,
  payment_reference TEXT,
  payment_processor TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_event_payment_details ENABLE ROW LEVEL SECURITY;

-- Only admins can access payment details
CREATE POLICY "Admins can manage mentor event payment details"
ON public.mentor_event_payment_details FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own payment details
CREATE POLICY "Users can view own mentor event payment details"
ON public.mentor_event_payment_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentor_event_registrations 
    WHERE id = registration_id 
    AND user_id = auth.uid()
  )
);

-- Migrate existing payment references to new table
INSERT INTO public.mentor_event_payment_details (registration_id, payment_reference)
SELECT id, payment_reference 
FROM public.mentor_event_registrations 
WHERE payment_reference IS NOT NULL
ON CONFLICT (registration_id) DO NOTHING;

-- Remove payment_reference from mentor_event_registrations
ALTER TABLE public.mentor_event_registrations DROP COLUMN IF EXISTS payment_reference;

-- =====================================================
-- FIX 4: Secure Program Registration Payment References
-- Create separate table for payment details with restricted access
-- =====================================================

-- Create secure payment details table
CREATE TABLE IF NOT EXISTS public.program_payment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID UNIQUE NOT NULL REFERENCES public.program_registrations(id) ON DELETE CASCADE,
  payment_reference TEXT,
  payment_processor TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.program_payment_details ENABLE ROW LEVEL SECURITY;

-- Only admins can access payment details
CREATE POLICY "Admins can manage program payment details"
ON public.program_payment_details FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own payment details
CREATE POLICY "Users can view own program payment details"
ON public.program_payment_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.program_registrations 
    WHERE id = registration_id 
    AND user_id = auth.uid()
  )
);

-- Migrate existing payment references to new table
INSERT INTO public.program_payment_details (registration_id, payment_reference)
SELECT id, payment_reference 
FROM public.program_registrations 
WHERE payment_reference IS NOT NULL
ON CONFLICT (registration_id) DO NOTHING;

-- Remove payment_reference from program_registrations
ALTER TABLE public.program_registrations DROP COLUMN IF EXISTS payment_reference;