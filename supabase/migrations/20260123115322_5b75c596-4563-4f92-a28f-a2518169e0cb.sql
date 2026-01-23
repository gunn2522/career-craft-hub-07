-- Add enrollment tracking to roadmaps
CREATE TABLE IF NOT EXISTS public.roadmap_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, roadmap_id)
);

-- Enable RLS
ALTER TABLE public.roadmap_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can see their enrollments
CREATE POLICY "Users can view their enrollments" ON public.roadmap_enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can enroll themselves
CREATE POLICY "Users can enroll themselves" ON public.roadmap_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);