-- Add SELECT policy for ambassador_applications to restrict access to admins only
CREATE POLICY "Only admins can view applications" 
ON public.ambassador_applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));