-- Create career_domains table (Level 1)
CREATE TABLE public.career_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career_categories table (Level 2)
CREATE TABLE public.career_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.career_domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain_id, name)
);

-- Add domain_id and category_id to careers table (Level 3)
ALTER TABLE public.careers 
ADD COLUMN domain_id UUID REFERENCES public.career_domains(id) ON DELETE SET NULL,
ADD COLUMN category_id UUID REFERENCES public.career_categories(id) ON DELETE SET NULL,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update roadmaps to have explicit career_id reference (already exists, just ensure it's used)
-- Add domain_id and category_id for easier querying
ALTER TABLE public.roadmaps
ADD COLUMN domain_id UUID REFERENCES public.career_domains(id) ON DELETE SET NULL,
ADD COLUMN category_id UUID REFERENCES public.career_categories(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.career_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for career_domains
CREATE POLICY "Anyone can view active domains" ON public.career_domains
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage domains" ON public.career_domains
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for career_categories
CREATE POLICY "Anyone can view active categories" ON public.career_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.career_categories
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Update triggers for updated_at
CREATE TRIGGER update_career_domains_updated_at
BEFORE UPDATE ON public.career_domains
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_categories_updated_at
BEFORE UPDATE ON public.career_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample domains
INSERT INTO public.career_domains (name, icon, description, display_order) VALUES
('Technology', 'Monitor', 'Technology and software development careers', 1),
('Business', 'Briefcase', 'Business and management careers', 2),
('Creative', 'Palette', 'Creative and design careers', 3),
('Healthcare', 'Heart', 'Healthcare and medical careers', 4),
('Engineering', 'Wrench', 'Engineering and technical careers', 5),
('Education', 'GraduationCap', 'Education and teaching careers', 6),
('Finance', 'DollarSign', 'Finance and accounting careers', 7);

-- Insert sample categories for Technology domain
INSERT INTO public.career_categories (domain_id, name, description, display_order)
SELECT d.id, c.name, c.description, c.display_order
FROM public.career_domains d
CROSS JOIN (VALUES
  ('Web Development', 'Build websites and web applications', 1),
  ('Data Science', 'Analyze data and build ML models', 2),
  ('AI & Machine Learning', 'Develop intelligent systems', 3),
  ('Cybersecurity', 'Protect systems and data', 4),
  ('Cloud Computing', 'Design and manage cloud infrastructure', 5),
  ('Mobile Development', 'Build mobile applications', 6)
) AS c(name, description, display_order)
WHERE d.name = 'Technology';