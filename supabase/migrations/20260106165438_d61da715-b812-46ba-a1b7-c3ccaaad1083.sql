-- =============================================
-- SCHOOL STUDENT CAREER FLOW SYSTEM
-- Stream → Category → Degree → Job Role
-- =============================================

-- Create degrees table for school students
CREATE TABLE public.degrees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    category_id UUID REFERENCES public.career_categories(id) ON DELETE SET NULL,
    entrance_exams TEXT[] DEFAULT '{}',
    eligibility_rules JSONB DEFAULT '{}',
    required_subjects TEXT[] DEFAULT '{}',
    mapped_roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;

-- Create policies for degrees
CREATE POLICY "Anyone can view active degrees"
    ON public.degrees
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage degrees"
    ON public.degrees
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_degrees_updated_at
    BEFORE UPDATE ON public.degrees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add verification_status to mentor_profiles for mentor verification system
ALTER TABLE public.mentor_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create admin_tiers enum and table for admin hierarchy
DO $$ BEGIN
    CREATE TYPE public.admin_tier AS ENUM ('super_admin', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_permissions table for granular access control
CREATE TABLE public.admin_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    admin_tier admin_tier NOT NULL DEFAULT 'moderator',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admins can manage admin permissions
CREATE POLICY "Super admins can manage permissions"
    ON public.admin_permissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_permissions ap
            WHERE ap.user_id = auth.uid() 
            AND ap.admin_tier = 'super_admin'
            AND ap.is_active = true
        )
    );

CREATE POLICY "Admins can view permissions"
    ON public.admin_permissions
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_permissions_updated_at
    BEFORE UPDATE ON public.admin_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin_activity_logs table for audit trail
CREATE TABLE public.admin_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view logs
CREATE POLICY "Admins can view activity logs"
    ON public.admin_activity_logs
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Only super_admins can insert logs (via functions)
CREATE POLICY "System can insert logs"
    ON public.admin_activity_logs
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Link careers to degrees for school student flow
ALTER TABLE public.careers
ADD COLUMN IF NOT EXISTS linked_degree_ids UUID[] DEFAULT '{}';

-- Add school student specific fields to careers
ALTER TABLE public.careers
ADD COLUMN IF NOT EXISTS after_12th_description TEXT,
ADD COLUMN IF NOT EXISTS required_stream TEXT;

-- Insert default admin permissions for existing admin
INSERT INTO public.admin_permissions (user_id, admin_tier, permissions)
SELECT ur.user_id, 'super_admin', '{"all": true}'::jsonb
FROM public.user_roles ur
WHERE ur.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;