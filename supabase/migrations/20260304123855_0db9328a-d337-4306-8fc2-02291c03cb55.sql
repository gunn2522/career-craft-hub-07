
-- Recreate public_profiles view with security_definer (NOT security_invoker)
-- This allows the view to bypass RLS since the view itself restricts columns
-- The base profiles table RLS still protects direct access
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_barrier = true) AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  bio,
  user_type,
  institution,
  skills,
  is_public,
  is_mentor,
  is_recruiter,
  years_experience,
  job_title,
  current_company,
  created_at
FROM public.profiles;

-- Grant access
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
