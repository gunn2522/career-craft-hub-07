-- Add explicit SELECT policy for admins on partner_profiles to ensure they can view all partners
-- The ALL policy should work but adding explicit SELECT for clarity

-- First check if there's an issue with the ALL policy by creating explicit SELECT
CREATE POLICY "Admins can view all partner profiles"
ON public.partner_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));