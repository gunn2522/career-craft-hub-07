-- Update RLS policies to allow mentors to manage daily_assignments
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.daily_assignments;
CREATE POLICY "Admins and mentors can manage assignments" 
ON public.daily_assignments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));

-- Update RLS policies for blogs - allow mentors to create/manage their own blogs
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
CREATE POLICY "Admins can manage all blogs" 
ON public.blogs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentors can manage their own blogs" 
ON public.blogs 
FOR ALL 
USING (has_role(auth.uid(), 'mentor'::app_role) AND author_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'mentor'::app_role) AND author_id = auth.uid());

-- Update RLS policies for resources - allow mentors to add resources
DROP POLICY IF EXISTS "Admins can manage resources" ON public.resources;
CREATE POLICY "Admins can manage all resources" 
ON public.resources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentors can manage resources" 
ON public.resources 
FOR ALL 
USING (has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'mentor'::app_role));

-- Update RLS policies for internships - allow mentors to post internships
DROP POLICY IF EXISTS "Admins can manage internships" ON public.internships;
CREATE POLICY "Admins can manage all internships" 
ON public.internships 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentors can manage internships" 
ON public.internships 
FOR ALL 
USING (has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'mentor'::app_role));

-- Update RLS policies for programs - allow mentors to create their own programs
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage all programs" 
ON public.programs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add created_by column to programs table if not exists
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

CREATE POLICY "Mentors can manage their own programs" 
ON public.programs 
FOR ALL 
USING (has_role(auth.uid(), 'mentor'::app_role) AND (created_by = auth.uid() OR created_by IS NULL))
WITH CHECK (has_role(auth.uid(), 'mentor'::app_role));

-- Update RLS policies for roadmaps - allow mentors to view roadmaps for assignment purposes
DROP POLICY IF EXISTS "Admins can manage roadmaps" ON public.roadmaps;
CREATE POLICY "Admins can manage roadmaps" 
ON public.roadmaps 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mentors can view all roadmaps (for assigning daily tasks)
CREATE POLICY "Mentors can view roadmaps" 
ON public.roadmaps 
FOR SELECT 
USING (has_role(auth.uid(), 'mentor'::app_role));