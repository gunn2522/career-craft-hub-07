-- =============================================
-- Institutions & Partner Companies Module Enhancement
-- =============================================

-- Add user_id to institutions to allow self-management
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS vision text;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS focus_areas text[];
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS programs_offered text[];
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS past_collaborations text[];
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS institution_type text; -- school, college

-- Enhance partner_profiles table for full dashboard
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS hiring_focus text[];
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS internship_opportunities text;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS project_opportunities text;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS events_initiatives text;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0;
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT false;

-- Partners table (for homepage logos) - add verified flag
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- =============================================
-- Pricing Plans Table for Institutions & Companies
-- =============================================
CREATE TABLE IF NOT EXISTS public.organization_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  plan_type text NOT NULL, -- 'school', 'college', 'partner'
  price numeric DEFAULT 0,
  currency text DEFAULT 'INR',
  billing_cycle text DEFAULT 'monthly', -- monthly, yearly, one-time
  features jsonb DEFAULT '[]',
  max_events integer,
  max_resources integer,
  visibility_level text DEFAULT 'basic', -- basic, enhanced, premium
  support_level text DEFAULT 'standard', -- standard, priority, dedicated
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- Organization Plan Subscriptions
-- =============================================
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_type text NOT NULL, -- 'institution', 'partner'
  organization_id uuid NOT NULL,
  plan_id uuid REFERENCES public.organization_plans(id),
  status text DEFAULT 'pending', -- pending, active, expired, cancelled
  started_at timestamp with time zone,
  expires_at timestamp with time zone,
  payment_reference text,
  payment_amount numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- MoU Documents Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.mou_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  document_url text,
  target_type text NOT NULL, -- 'school', 'college', 'partner'
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- Onboarding Inquiries Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.organization_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_type text NOT NULL, -- 'school', 'college', 'partner'
  organization_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  message text,
  inquiry_status text DEFAULT 'new', -- new, contacted, in_discussion, converted, closed
  plan_interested_id uuid REFERENCES public.organization_plans(id),
  notes text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- Partner Company Events (similar to institution_events)
-- =============================================
CREATE TABLE IF NOT EXISTS public.partner_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text, -- 'hiring_drive', 'tech_talk', 'webinar', 'workshop'
  event_date timestamp with time zone,
  location text,
  mode text DEFAULT 'online', -- online, offline, hybrid
  registration_url text,
  max_attendees integer,
  current_registrations integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_approved boolean DEFAULT false,
  category_id uuid REFERENCES public.career_categories(id),
  stream_id uuid REFERENCES public.career_domains(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- School Student Stream Selection (after psychometric test)
-- =============================================
CREATE TABLE IF NOT EXISTS public.student_stream_selections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_stream text NOT NULL, -- 'arts', 'commerce', 'medical', 'non_medical'
  psychometric_response_id uuid REFERENCES public.psychometric_responses(id),
  selected_at timestamp with time zone NOT NULL DEFAULT now(),
  is_confirmed boolean DEFAULT false,
  UNIQUE(user_id)
);

-- =============================================
-- Add event audience field to institution_events
-- =============================================
ALTER TABLE public.institution_events ADD COLUMN IF NOT EXISTS audience text DEFAULT 'public'; -- school, college, public
ALTER TABLE public.institution_events ADD COLUMN IF NOT EXISTS max_attendees integer;
ALTER TABLE public.institution_events ADD COLUMN IF NOT EXISTS current_registrations integer DEFAULT 0;
ALTER TABLE public.institution_events ADD COLUMN IF NOT EXISTS registration_url text;
ALTER TABLE public.institution_events ADD COLUMN IF NOT EXISTS event_type text; -- workshop, competition, career_fair, guest_session
ALTER TABLE public.institution_events ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- =============================================
-- Enable RLS on new tables
-- =============================================
ALTER TABLE public.organization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mou_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stream_selections ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Organization Plans - public read, admin write
CREATE POLICY "Anyone can view active plans" ON public.organization_plans FOR SELECT USING (is_active = true);

-- Organization Subscriptions - users can view their own
CREATE POLICY "Users can view their org subscriptions" ON public.organization_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can insert org subscriptions" ON public.organization_subscriptions FOR INSERT WITH CHECK (true);

-- MoU Documents - public read
CREATE POLICY "Anyone can view active MoU documents" ON public.mou_documents FOR SELECT USING (is_active = true);

-- Organization Inquiries - users can manage their own
CREATE POLICY "Users can view their inquiries" ON public.organization_inquiries FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Anyone can create inquiry" ON public.organization_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their inquiries" ON public.organization_inquiries FOR UPDATE USING (user_id = auth.uid());

-- Partner Events - public read approved, partners manage own
CREATE POLICY "Anyone can view approved partner events" ON public.partner_events FOR SELECT USING (is_approved = true AND is_active = true);
CREATE POLICY "Partners can manage their events" ON public.partner_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.partner_profiles WHERE id = partner_id AND user_id = auth.uid())
);

-- Student Stream Selections - users manage their own
CREATE POLICY "Users can view their stream selection" ON public.student_stream_selections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their stream selection" ON public.student_stream_selections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their stream selection" ON public.student_stream_selections FOR UPDATE USING (user_id = auth.uid());

-- Update institution_events policy to allow public viewing of approved events
DROP POLICY IF EXISTS "Anyone can view active events" ON public.institution_events;
CREATE POLICY "Anyone can view approved institution events" ON public.institution_events FOR SELECT USING (is_active = true);

-- Allow institutions to manage their own events
CREATE POLICY "Institutions can manage their events" ON public.institution_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.institutions WHERE id = institution_id AND user_id = auth.uid())
);

-- Update timestamps trigger for new tables
CREATE TRIGGER update_organization_plans_updated_at BEFORE UPDATE ON public.organization_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organization_subscriptions_updated_at BEFORE UPDATE ON public.organization_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mou_documents_updated_at BEFORE UPDATE ON public.mou_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organization_inquiries_updated_at BEFORE UPDATE ON public.organization_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partner_events_updated_at BEFORE UPDATE ON public.partner_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public) VALUES ('organization-logos', 'organization-logos', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for organization logos
CREATE POLICY "Anyone can view organization logos" ON storage.objects FOR SELECT USING (bucket_id = 'organization-logos');
CREATE POLICY "Authenticated users can upload organization logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their organization logos" ON storage.objects FOR UPDATE USING (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their organization logos" ON storage.objects FOR DELETE USING (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');