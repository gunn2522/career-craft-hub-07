
-- Fix: Replace overly permissive organization_subscriptions SELECT policy
DROP POLICY IF EXISTS "Users can view their org subscriptions" ON public.organization_subscriptions;

CREATE POLICY "Organizations view own subscriptions"
ON public.organization_subscriptions
FOR SELECT
TO authenticated
USING (
  -- Institution owners can see their subscriptions
  (organization_type = 'institution' AND 
   organization_id IN (SELECT id FROM public.institutions WHERE user_id = auth.uid()))
  OR
  -- Partner owners can see their subscriptions
  (organization_type = 'partner' AND 
   organization_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()))
  OR
  -- Admins can see all
  public.has_role(auth.uid(), 'admin')
);
