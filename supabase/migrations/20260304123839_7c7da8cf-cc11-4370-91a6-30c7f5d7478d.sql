
-- 1. Drop the overly broad "connected users" SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view connected or own profiles" ON public.profiles;

-- 2. Recreate the public_profiles view with additional safe fields for networking
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
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

-- 3. Grant access to the view for authenticated and anon roles
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
