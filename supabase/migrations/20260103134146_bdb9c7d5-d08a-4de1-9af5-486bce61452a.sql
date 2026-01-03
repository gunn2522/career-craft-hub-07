-- Create experience level enum
CREATE TYPE public.experience_level AS ENUM ('entry', 'mid', 'senior');

-- Add new columns to careers table
ALTER TABLE public.careers
ADD COLUMN experience_level public.experience_level DEFAULT 'entry',
ADD COLUMN search_keywords text[] DEFAULT '{}',
ADD COLUMN future_roles jsonb DEFAULT '[]',
ADD COLUMN skills_required text[] DEFAULT '{}',
ADD COLUMN transition_time text;

-- Add experience_level column to profiles table for user preference
ALTER TABLE public.profiles
ADD COLUMN preferred_experience_level public.experience_level;

-- Create career_progressions table for detailed career mapping
CREATE TABLE public.career_progressions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_career_id uuid REFERENCES public.careers(id) ON DELETE CASCADE,
  to_career_id uuid REFERENCES public.careers(id) ON DELETE CASCADE,
  progression_type text NOT NULL DEFAULT 'senior', -- senior, lateral, leadership, specialist
  skill_gap text[],
  recommended_roadmap_id uuid REFERENCES public.roadmaps(id),
  transition_time text,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_career_id, to_career_id)
);

-- Enable RLS
ALTER TABLE public.career_progressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view career progressions"
ON public.career_progressions
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage career progressions"
ON public.career_progressions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_career_progressions_updated_at
BEFORE UPDATE ON public.career_progressions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches
CREATE INDEX idx_careers_experience_level ON public.careers(experience_level);
CREATE INDEX idx_careers_search_keywords ON public.careers USING GIN(search_keywords);
CREATE INDEX idx_career_progressions_from ON public.career_progressions(from_career_id);
CREATE INDEX idx_career_progressions_to ON public.career_progressions(to_career_id);