-- Create visitor roles table for pre-login personalization
CREATE TABLE IF NOT EXISTS public.visitor_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create homepage sections table for CMS
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create homepage content per visitor role
CREATE TABLE IF NOT EXISTS public.homepage_role_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_role_id UUID REFERENCES public.visitor_roles(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  content JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(visitor_role_id, section_key)
);

-- Create live metrics table
CREATE TABLE IF NOT EXISTS public.site_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  value_type TEXT DEFAULT 'count', -- 'count', 'percentage', 'custom'
  custom_value TEXT,
  table_name TEXT, -- for auto-count from table
  count_condition JSONB, -- optional filter conditions
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_role_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;

-- Public read policies for visitor content
CREATE POLICY "Anyone can view active visitor roles"
ON public.visitor_roles FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view visible homepage sections"
ON public.homepage_sections FOR SELECT
USING (is_visible = true);

CREATE POLICY "Anyone can view visible role content"
ON public.homepage_role_content FOR SELECT
USING (is_visible = true);

CREATE POLICY "Anyone can view visible metrics"
ON public.site_metrics FOR SELECT
USING (is_visible = true);

-- Admin policies for management
CREATE POLICY "Admins can manage visitor roles"
ON public.visitor_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage homepage sections"
ON public.homepage_sections FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage role content"
ON public.homepage_role_content FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage metrics"
ON public.site_metrics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default visitor roles
INSERT INTO public.visitor_roles (name, display_name, description, icon, display_order) VALUES
('school_student', 'School Student', 'Currently in school, exploring career options after 12th', 'GraduationCap', 1),
('college_student', 'College Student', 'Pursuing higher education, building career skills', 'BookOpen', 2),
('mentor', 'Mentor', 'Industry professional ready to guide students', 'Users', 3),
('institution', 'School / College', 'Educational institution seeking partnerships', 'Building2', 4),
('partner', 'Partner Company', 'Company looking to hire or train talent', 'Briefcase', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert default homepage sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, display_order) VALUES
('hero', 'Craft Your Career. Build Your Future.', 'Discover your perfect career path, master in-demand skills, and connect with opportunities that transform your potential into success.', 1),
('pillars', 'The Three Pillars of Success', 'Our comprehensive approach to career development', 2),
('partners', 'Our Hiring & Industry Partners', 'Trusted by leading companies', 3),
('success_stories', 'Success Stories', 'Real journeys, real transformations', 4),
('ambassador', 'Become a Campus Ambassador', 'Lead the career revolution at your campus', 5),
('consultancy', 'Career Consultancy', 'Personalized guidance for your journey', 6),
('signup_cta', 'Ready to Start Your Career Journey?', 'Join thousands of students already on their path to success', 7)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default metrics (will be calculated live)
INSERT INTO public.site_metrics (metric_key, display_label, value_type, table_name, display_order) VALUES
('total_students', 'Students Guided', 'count', 'profiles', 1),
('total_mentors', 'Expert Mentors', 'count', 'mentor_profiles', 2),
('total_partners', 'Partner Companies', 'count', 'partners', 3),
('total_roadmaps', 'Career Paths', 'count', 'roadmaps', 4)
ON CONFLICT (metric_key) DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_visitor_roles_updated_at
BEFORE UPDATE ON public.visitor_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_role_content_updated_at
BEFORE UPDATE ON public.homepage_role_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_metrics_updated_at
BEFORE UPDATE ON public.site_metrics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();