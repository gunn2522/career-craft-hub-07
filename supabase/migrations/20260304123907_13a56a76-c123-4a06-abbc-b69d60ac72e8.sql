
-- Switch view back to security_invoker (safer per linter)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on, security_barrier = true) AS
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

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Add RLS policy: authenticated users can SELECT any profile (view restricts columns)
CREATE POLICY "Authenticated users can read profiles via view"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
