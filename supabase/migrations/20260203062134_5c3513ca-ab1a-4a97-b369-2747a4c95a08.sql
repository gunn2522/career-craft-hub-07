-- Drop the potentially conflicting explicit SELECT policy
DROP POLICY IF EXISTS "Admins can view all partner profiles" ON public.partner_profiles;

-- Drop and recreate the ALL policy with a more robust check
DROP POLICY IF EXISTS "Admins manage all partner profiles" ON public.partner_profiles;

-- Create a simplified admin policy using direct subquery (more reliable)
CREATE POLICY "Admins have full access to partner profiles"
ON public.partner_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);