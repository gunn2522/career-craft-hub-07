-- Fix infinite recursion in admin_permissions RLS policies
-- The problem: "Super admins can manage permissions" policy queries admin_permissions table itself

-- Step 1: Create a SECURITY DEFINER function to check super_admin status without recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_permissions
    WHERE user_id = _user_id
      AND admin_tier = 'super_admin'
      AND is_active = true
  )
$$;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Admins can view permissions" ON public.admin_permissions;

-- Step 3: Create fixed policies using the SECURITY DEFINER function
-- Super admins can do everything
CREATE POLICY "Super admins have full access"
ON public.admin_permissions FOR ALL
USING (is_super_admin(auth.uid()));

-- Admins can view all permissions (but not modify)
CREATE POLICY "Admins can view all permissions"
ON public.admin_permissions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own permission entry
CREATE POLICY "Users can view own permission"
ON public.admin_permissions FOR SELECT
USING (auth.uid() = user_id);