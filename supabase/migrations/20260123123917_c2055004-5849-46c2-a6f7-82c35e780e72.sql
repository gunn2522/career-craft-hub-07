-- Fix: Restrict profiles table access and create secure public view
-- Issue: profiles_table_public_exposure - Any authenticated user can view all public profile data including sensitive PII

-- Step 1: Drop the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Step 2: Create a secure view that only exposes non-sensitive profile data for discovery/networking
-- This view excludes: email, linkedin_url, portfolio_url, career_goals, current_company, job_title
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT 
    user_id,
    full_name,
    avatar_url,
    bio,
    user_type,
    institution,
    skills,
    is_public,
    created_at
FROM public.profiles
WHERE is_public = true;

-- Step 3: Grant SELECT access on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Step 4: Add a new restrictive SELECT policy that only allows:
-- - Users viewing their own profile
-- - Admins viewing any profile  
-- - Connected users viewing profiles they're connected to
CREATE POLICY "Authenticated users can view connected or own profiles"
ON public.profiles
FOR SELECT
USING (
    auth.uid() IS NOT NULL AND (
        -- User can always view their own profile
        auth.uid() = user_id
        -- Admins can view all profiles (covered by separate admin policy)
        -- Connected users can view each other's profiles (connections table has no status - direct connections)
        OR EXISTS (
            SELECT 1 FROM public.connections c
            WHERE (c.user_id = auth.uid() AND c.connected_user_id = profiles.user_id)
               OR (c.connected_user_id = auth.uid() AND c.user_id = profiles.user_id)
        )
    )
);