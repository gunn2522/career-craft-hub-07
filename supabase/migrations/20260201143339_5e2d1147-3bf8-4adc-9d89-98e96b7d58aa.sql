-- =============================================
-- PHASE 1: Partner Companies Module - Core Schema
-- =============================================

-- 1. Create partner verification status enum
DO $$ BEGIN
  CREATE TYPE public.partner_verification_status AS ENUM ('unverified', 'pending', 'verified', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Extend partner_profiles with new columns
ALTER TABLE public.partner_profiles
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS locations TEXT[],
ADD COLUMN IF NOT EXISTS verified_domain_id UUID REFERENCES public.career_domains(id),
ADD COLUMN IF NOT EXISTS verified_category_ids UUID[],
ADD COLUMN IF NOT EXISTS hiring_roles TEXT[],
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS featured_on_homepage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(2,1) DEFAULT 0;

-- 3. Create partner_verified_domains junction table
CREATE TABLE IF NOT EXISTS public.partner_verified_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.career_domains(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, domain_id)
);

-- 4. Create partner_verified_categories junction table
CREATE TABLE IF NOT EXISTS public.partner_verified_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.career_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, category_id)
);

-- 5. Create partner_posts table for content posting
CREATE TABLE IF NOT EXISTS public.partner_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  post_type TEXT NOT NULL DEFAULT 'update', -- 'update', 'announcement', 'media', 'article'
  image_url TEXT,
  external_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  target_domain_ids UUID[],
  target_category_ids UUID[],
  target_years TEXT[], -- 'first_year', 'second_year', etc.
  target_qualifications TEXT[], -- 'undergraduate', 'graduate', etc.
  target_streams TEXT[], -- 'engineering', 'commerce', etc.
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create partner_jobs table
CREATE TABLE IF NOT EXISTS public.partner_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL DEFAULT 'full_time', -- 'full_time', 'part_time', 'internship', 'contract'
  experience_level TEXT DEFAULT 'entry', -- 'entry', 'mid', 'senior'
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'INR',
  application_url TEXT,
  application_deadline TIMESTAMPTZ,
  requirements TEXT[],
  responsibilities TEXT[],
  skills_required TEXT[],
  domain_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  target_years TEXT[],
  target_qualifications TEXT[],
  target_streams TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create partner_events table
CREATE TABLE IF NOT EXISTS public.partner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'webinar', -- 'webinar', 'workshop', 'hackathon', 'campus_drive', 'career_fair'
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  is_virtual BOOLEAN DEFAULT TRUE,
  meeting_link TEXT,
  registration_url TEXT,
  max_attendees INTEGER,
  current_registrations INTEGER DEFAULT 0,
  domain_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  target_years TEXT[],
  target_qualifications TEXT[],
  target_streams TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create partner_interview_processes table
CREATE TABLE IF NOT EXISTS public.partner_interview_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  total_rounds INTEGER DEFAULT 1,
  stages JSONB DEFAULT '[]', -- Array of {stage_name, description, duration, skills_tested}
  preparation_tips TEXT[],
  common_questions TEXT[],
  difficulty_level TEXT DEFAULT 'medium',
  average_duration TEXT,
  domain_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create partner_notifications table
CREATE TABLE IF NOT EXISTS public.partner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  notification_type TEXT NOT NULL, -- 'job', 'event', 'post', 'update'
  reference_id UUID,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create partner_link_validations table for link integrity
CREATE TABLE IF NOT EXISTS public.partner_link_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  link_type TEXT NOT NULL, -- 'website', 'linkedin', 'application', 'meeting'
  last_checked_at TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Create audit_logs table for partner actions
CREATE TABLE IF NOT EXISTS public.partner_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'post_created', 'job_published', 'event_created', etc.
  entity_type TEXT, -- 'post', 'job', 'event', 'profile'
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Create public company page view
CREATE OR REPLACE VIEW public.public_partner_profiles AS
SELECT 
  pp.id,
  pp.slug,
  pp.company_name,
  pp.company_description,
  pp.tagline,
  pp.logo_url,
  pp.cover_image_url,
  pp.company_website,
  pp.industry,
  pp.founded_year,
  pp.company_size,
  pp.headquarters,
  pp.locations,
  pp.hiring_focus,
  pp.hiring_roles,
  pp.social_links,
  pp.verification_status,
  pp.verified_at,
  pp.profile_views,
  pp.avg_rating,
  pp.created_at
FROM public.partner_profiles pp
WHERE pp.verification_status = 'verified'
  AND pp.is_visible = TRUE
  AND pp.is_approved = TRUE;

-- 13. Enable RLS on all new tables
ALTER TABLE public.partner_verified_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_verified_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_interview_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_link_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_audit_logs ENABLE ROW LEVEL SECURITY;

-- 14. RLS Policies for partner_verified_domains
CREATE POLICY "Partners manage own domains" ON public.partner_verified_domains
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Public read verified domains" ON public.partner_verified_domains
  FOR SELECT USING (true);

-- 15. RLS Policies for partner_verified_categories
CREATE POLICY "Partners manage own categories" ON public.partner_verified_categories
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Public read verified categories" ON public.partner_verified_categories
  FOR SELECT USING (true);

-- 16. RLS Policies for partner_posts
CREATE POLICY "Partners manage own posts" ON public.partner_posts
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Public read published posts" ON public.partner_posts
  FOR SELECT USING (is_published = TRUE AND is_approved = TRUE);

CREATE POLICY "Admin manage all posts" ON public.partner_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 17. RLS Policies for partner_jobs
CREATE POLICY "Partners manage own jobs" ON public.partner_jobs
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Public read active jobs" ON public.partner_jobs
  FOR SELECT USING (is_active = TRUE AND is_approved = TRUE);

CREATE POLICY "Admin manage all jobs" ON public.partner_jobs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 18. RLS Policies for partner_events
CREATE POLICY "Partners manage own events" ON public.partner_events
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Public read active events" ON public.partner_events
  FOR SELECT USING (is_active = TRUE AND is_approved = TRUE);

CREATE POLICY "Admin manage all events" ON public.partner_events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 19. RLS Policies for partner_interview_processes
CREATE POLICY "Partners manage own interview processes" ON public.partner_interview_processes
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Public read published interview processes" ON public.partner_interview_processes
  FOR SELECT USING (is_published = TRUE);

-- 20. RLS Policies for partner_notifications
CREATE POLICY "Recipients read own notifications" ON public.partner_notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Partners create notifications" ON public.partner_notifications
  FOR INSERT WITH CHECK (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

-- 21. RLS Policies for partner_link_validations
CREATE POLICY "Partners manage own link validations" ON public.partner_link_validations
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

-- 22. RLS Policies for partner_audit_logs
CREATE POLICY "Partners read own audit logs" ON public.partner_audit_logs
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin read all audit logs" ON public.partner_audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System insert audit logs" ON public.partner_audit_logs
  FOR INSERT WITH CHECK (true);

-- 23. Create function to generate partner slug
CREATE OR REPLACE FUNCTION public.generate_partner_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    IF TG_OP = 'UPDATE' AND OLD.company_name = NEW.company_name THEN
      RETURN NEW;
    END IF;
  END IF;
  
  IF NEW.company_name IS NULL OR NEW.company_name = '' THEN
    RETURN NEW;
  END IF;
  
  base_slug := lower(regexp_replace(NEW.company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.partner_profiles WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 24. Create trigger for partner slug generation
DROP TRIGGER IF EXISTS generate_partner_slug_trigger ON public.partner_profiles;
CREATE TRIGGER generate_partner_slug_trigger
  BEFORE INSERT OR UPDATE ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_partner_slug();

-- 25. Create function to calculate partner profile completion
CREATE OR REPLACE FUNCTION public.calculate_partner_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion INTEGER := 0;
  total_fields INTEGER := 12;
  filled_fields INTEGER := 0;
BEGIN
  IF NEW.company_name IS NOT NULL AND NEW.company_name != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.company_description IS NOT NULL AND NEW.company_description != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.logo_url IS NOT NULL AND NEW.logo_url != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.company_website IS NOT NULL AND NEW.company_website != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.industry IS NOT NULL AND NEW.industry != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.social_links IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.headquarters IS NOT NULL AND NEW.headquarters != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.company_size IS NOT NULL AND NEW.company_size != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.hiring_focus IS NOT NULL AND array_length(NEW.hiring_focus, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.tagline IS NOT NULL AND NEW.tagline != '' THEN filled_fields := filled_fields + 1; END IF;
  
  NEW.profile_completion := (filled_fields * 100) / total_fields;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 26. Create trigger for profile completion calculation
DROP TRIGGER IF EXISTS calculate_partner_completion_trigger ON public.partner_profiles;
CREATE TRIGGER calculate_partner_completion_trigger
  BEFORE INSERT OR UPDATE ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_partner_profile_completion();

-- 27. Create indexes for search optimization
CREATE INDEX IF NOT EXISTS idx_partner_profiles_slug ON public.partner_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_company_name ON public.partner_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_industry ON public.partner_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_verification ON public.partner_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_partner_jobs_active ON public.partner_jobs(is_active, is_approved);
CREATE INDEX IF NOT EXISTS idx_partner_jobs_domain ON public.partner_jobs(domain_id);
CREATE INDEX IF NOT EXISTS idx_partner_events_date ON public.partner_events(event_date);
CREATE INDEX IF NOT EXISTS idx_partner_posts_published ON public.partner_posts(is_published, is_approved);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';