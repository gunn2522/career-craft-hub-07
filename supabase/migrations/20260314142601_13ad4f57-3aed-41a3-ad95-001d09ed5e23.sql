
-- Add new columns to resources table
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS step_index integer,
  ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;

-- Backfill step_index from category field
UPDATE public.resources
SET step_index = CAST(REPLACE(category, 'step_', '') AS integer)
WHERE category LIKE 'step_%';

-- Drop all existing policies on resources to start clean
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'resources' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.resources', pol.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved resources
CREATE POLICY "Anyone can view approved resources"
  ON public.resources FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mentors can insert resources (pending approval)
CREATE POLICY "Mentors can submit resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'mentor')
    AND added_by = auth.uid()
    AND is_approved = false
  );

-- Mentors can view their own unapproved resources
CREATE POLICY "Mentors can view own unapproved resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (added_by = auth.uid() AND is_approved = false);
