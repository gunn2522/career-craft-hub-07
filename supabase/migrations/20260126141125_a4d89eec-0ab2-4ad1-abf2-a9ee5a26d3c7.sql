-- Fix duplicate user roles issue
-- First, delete duplicate entries keeping only the highest privilege role

-- Delete the 'user' role for users who also have 'admin' role
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'
) AND role = 'user';

-- Create a function to get the highest role for a user
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'mentor' THEN 2
      WHEN 'partner' THEN 3
      WHEN 'moderator' THEN 4
      WHEN 'user' THEN 5
    END
  LIMIT 1
$$;