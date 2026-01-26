-- Fix the Security Definer View issue by recreating with explicit INVOKER
DROP VIEW IF EXISTS public.public_mentor_profiles;

CREATE VIEW public.public_mentor_profiles 
WITH (security_invoker = true)
AS
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
  created_at,
  updated_at
FROM public.mentor_profiles
WHERE verification_status = 'verified';

-- Re-grant access to the view
GRANT SELECT ON public.public_mentor_profiles TO authenticated;
GRANT SELECT ON public.public_mentor_profiles TO anon;