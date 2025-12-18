-- Drop existing restrictive policies on ambassador_applications
DROP POLICY IF EXISTS "Admins can manage applications" ON public.ambassador_applications;
DROP POLICY IF EXISTS "Users can submit applications" ON public.ambassador_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.ambassador_applications;

-- Create PERMISSIVE policies (default behavior - at least one must pass)
-- Admins can do everything
CREATE POLICY "Admins can manage all applications"
ON public.ambassador_applications
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can only view their own applications
CREATE POLICY "Users can view own applications"
ON public.ambassador_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can submit their own applications
CREATE POLICY "Users can submit own applications"
ON public.ambassador_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also fix event_registrations to use PERMISSIVE policies
DROP POLICY IF EXISTS "Users can manage their event registrations" ON public.event_registrations;

-- Users can only see their own registrations
CREATE POLICY "Users can view own registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own registrations
CREATE POLICY "Users can create own registrations"
ON public.event_registrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own registrations
CREATE POLICY "Users can delete own registrations"
ON public.event_registrations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);