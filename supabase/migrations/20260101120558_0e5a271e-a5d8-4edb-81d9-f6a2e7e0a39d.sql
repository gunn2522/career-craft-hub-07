-- Add policy for users to view their own applications (so they can check status)
CREATE POLICY "Users can view their own applications"
ON public.ambassador_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for users to update their own pending applications
CREATE POLICY "Users can update their own pending applications"
ON public.ambassador_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Add policy for users to delete/withdraw their own pending applications
CREATE POLICY "Users can withdraw their own pending applications"
ON public.ambassador_applications
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');