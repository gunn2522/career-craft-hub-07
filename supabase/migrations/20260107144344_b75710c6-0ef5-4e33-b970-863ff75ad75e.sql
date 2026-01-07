-- Create institutions table for schools, colleges, companies
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'college', -- school, college, company
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create institution_members table
CREATE TABLE IF NOT EXISTS public.institution_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create institution_events table for events posted by institutions
CREATE TABLE IF NOT EXISTS public.institution_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  mode TEXT DEFAULT 'online', -- online, offline, hybrid
  stream_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create institution_resources table
CREATE TABLE IF NOT EXISTS public.institution_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'article', -- article, video, document, link
  url TEXT,
  stream_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_posts table for mentor content
CREATE TABLE IF NOT EXISTS public.mentor_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_metrics table for configurable live metrics
CREATE TABLE IF NOT EXISTS public.admin_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  table_name TEXT,
  count_condition JSONB DEFAULT '{}',
  custom_value TEXT,
  value_type TEXT DEFAULT 'count', -- count, custom
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Anyone can view visible institutions" ON public.institutions FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage institutions" ON public.institutions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for institution_members
CREATE POLICY "Anyone can view institution members" ON public.institution_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage members" ON public.institution_members FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can join institutions" ON public.institution_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for institution_events
CREATE POLICY "Anyone can view active events" ON public.institution_events FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage institution events" ON public.institution_events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for institution_resources
CREATE POLICY "Anyone can view approved resources" ON public.institution_resources FOR SELECT USING (is_approved = true);
CREATE POLICY "Admins can manage institution resources" ON public.institution_resources FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_posts
CREATE POLICY "Anyone can view published posts" ON public.mentor_posts FOR SELECT USING (is_published = true AND is_approved = true);
CREATE POLICY "Mentors can manage own posts" ON public.mentor_posts FOR ALL USING (has_role(auth.uid(), 'mentor'::app_role) AND mentor_id = auth.uid());
CREATE POLICY "Admins can manage all posts" ON public.mentor_posts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for admin_metrics
CREATE POLICY "Anyone can view visible metrics" ON public.admin_metrics FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage metrics" ON public.admin_metrics FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_institution_events_updated_at BEFORE UPDATE ON public.institution_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_institution_resources_updated_at BEFORE UPDATE ON public.institution_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentor_posts_updated_at BEFORE UPDATE ON public.mentor_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_metrics_updated_at BEFORE UPDATE ON public.admin_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default metrics configuration
INSERT INTO public.admin_metrics (metric_key, display_label, table_name, value_type, display_order, is_visible) VALUES
  ('total_students', 'Students Onboarded', 'profiles', 'count', 1, true),
  ('total_mentors', 'Verified Mentors', 'mentor_profiles', 'count', 2, true),
  ('total_roadmaps', 'Career Roadmaps', 'roadmaps', 'count', 3, true),
  ('total_partners', 'Partner Companies', 'partners', 'count', 4, true),
  ('total_institutions', 'Institutions', 'institutions', 'count', 5, true),
  ('total_events', 'Events Hosted', 'events', 'count', 6, true)
ON CONFLICT (metric_key) DO NOTHING;