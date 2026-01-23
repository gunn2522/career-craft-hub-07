-- Fix overly permissive RLS policies

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can view their org subscriptions" ON public.organization_subscriptions;
DROP POLICY IF EXISTS "Users can insert org subscriptions" ON public.organization_subscriptions;
DROP POLICY IF EXISTS "Anyone can create inquiry" ON public.organization_inquiries;

-- Create proper policies for organization_subscriptions
-- Users can only view subscriptions for their own organizations
CREATE POLICY "Users can view own org subscriptions" ON public.organization_subscriptions 
FOR SELECT USING (
  (organization_type = 'institution' AND EXISTS (
    SELECT 1 FROM public.institutions WHERE id = organization_id AND user_id = auth.uid()
  ))
  OR
  (organization_type = 'partner' AND EXISTS (
    SELECT 1 FROM public.partner_profiles WHERE id = organization_id AND user_id = auth.uid()
  ))
);

-- Users can only insert subscriptions for their own organizations
CREATE POLICY "Users can insert own org subscriptions" ON public.organization_subscriptions 
FOR INSERT WITH CHECK (
  (organization_type = 'institution' AND EXISTS (
    SELECT 1 FROM public.institutions WHERE id = organization_id AND user_id = auth.uid()
  ))
  OR
  (organization_type = 'partner' AND EXISTS (
    SELECT 1 FROM public.partner_profiles WHERE id = organization_id AND user_id = auth.uid()
  ))
);

-- Authenticated users can create inquiries (with user_id tied to them)
CREATE POLICY "Authenticated users can create inquiry" ON public.organization_inquiries 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));