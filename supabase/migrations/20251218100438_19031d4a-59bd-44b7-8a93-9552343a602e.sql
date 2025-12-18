-- Remove user self-view policy - only admins should see applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.ambassador_applications;

-- Add admin SELECT policy for event_registrations
CREATE POLICY "Admins can view all registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));