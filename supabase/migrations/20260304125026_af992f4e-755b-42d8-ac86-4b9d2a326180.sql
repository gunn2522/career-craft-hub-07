
-- Fix 1: Storage - Replace blanket partner role policies with folder-isolated ones
DROP POLICY IF EXISTS "Partners can upload organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Partners can update organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete organization logos" ON storage.objects;

CREATE POLICY "Users upload to own folder only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Users update own folder only"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Users delete own folder only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Fix 2: Remove duplicate/stale org subscriptions SELECT policy
DROP POLICY IF EXISTS "Users can view own org subscriptions" ON public.organization_subscriptions;
