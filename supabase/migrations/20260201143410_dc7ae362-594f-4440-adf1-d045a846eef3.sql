-- Fix security issues from Phase 1

-- 1. Drop and recreate the view without SECURITY DEFINER (use SECURITY INVOKER)
DROP VIEW IF EXISTS public.public_partner_profiles;

CREATE VIEW public.public_partner_profiles 
WITH (security_invoker = true)
AS
SELECT 
  pp.id,
  pp.slug,
  pp.company_name,
  pp.company_description,
  pp.tagline,
  pp.logo_url,
  pp.cover_image_url,
  pp.company_website,
  pp.industry,
  pp.founded_year,
  pp.company_size,
  pp.headquarters,
  pp.locations,
  pp.hiring_focus,
  pp.hiring_roles,
  pp.social_links,
  pp.verification_status,
  pp.verified_at,
  pp.profile_views,
  pp.avg_rating,
  pp.created_at
FROM public.partner_profiles pp
WHERE pp.verification_status = 'verified'
  AND pp.is_visible = TRUE
  AND pp.is_approved = TRUE;

-- 2. Fix overly permissive audit log INSERT policy
DROP POLICY IF EXISTS "System insert audit logs" ON public.partner_audit_logs;

CREATE POLICY "Partner insert own audit logs" ON public.partner_audit_logs
  FOR INSERT WITH CHECK (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';