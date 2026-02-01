-- Drop existing restrictive INSERT policy for organization logos
DROP POLICY IF EXISTS "Users can upload their own organization logos" ON storage.objects;

-- Create a simpler policy that allows authenticated partners to upload logos
-- Files are still organized by user folder for management purposes
CREATE POLICY "Partners can upload organization logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos'
  AND (
    -- Allow if user has partner role
    has_role(auth.uid(), 'partner'::app_role)
    OR
    -- Or if uploading to their own folder
    (auth.uid())::text = (storage.foldername(name))[1]
    OR
    -- Or if admin
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Also update the UPDATE policy to be more permissive for partners
DROP POLICY IF EXISTS "Users can update their own organization logos" ON storage.objects;

CREATE POLICY "Partners can update organization logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (
    has_role(auth.uid(), 'partner'::app_role)
    OR (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Update DELETE policy similarly
DROP POLICY IF EXISTS "Users can delete their own organization logos" ON storage.objects;

CREATE POLICY "Partners can delete organization logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (
    has_role(auth.uid(), 'partner'::app_role)
    OR (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);