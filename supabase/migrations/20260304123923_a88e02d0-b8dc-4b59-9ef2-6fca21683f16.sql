
-- Remove the overly broad policy we just added
DROP POLICY IF EXISTS "Authenticated users can read profiles via view" ON public.profiles;

-- Drop the view, we'll use a security definer function instead
DROP VIEW IF EXISTS public.public_profiles;

-- Create a security definer function to safely fetch public profile data
CREATE OR REPLACE FUNCTION public.get_public_profiles(user_ids uuid[] DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  bio text,
  user_type public.user_type,
  institution text,
  skills text[],
  is_public boolean,
  is_mentor boolean,
  is_recruiter boolean,
  years_experience integer,
  job_title text,
  current_company text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.user_type,
    p.institution,
    p.skills,
    p.is_public,
    p.is_mentor,
    p.is_recruiter,
    p.years_experience,
    p.job_title,
    p.current_company,
    p.created_at
  FROM public.profiles p
  WHERE 
    CASE 
      WHEN user_ids IS NOT NULL THEN p.user_id = ANY(user_ids)
      ELSE p.is_public = true
    END
$$;

-- Recreate the view using the function for backward compatibility with existing code
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT * FROM public.get_public_profiles();

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
