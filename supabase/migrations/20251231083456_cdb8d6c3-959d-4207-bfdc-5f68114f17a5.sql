-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can submit own applications" ON public.ambassador_applications;

-- Create a new policy that requires authentication AND matches user_id
CREATE POLICY "Authenticated users can submit own applications" 
ON public.ambassador_applications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);