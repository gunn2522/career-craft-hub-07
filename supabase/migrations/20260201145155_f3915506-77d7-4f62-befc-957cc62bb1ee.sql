
-- =====================================================
-- CREATE PARTNER_INTERVIEW_STAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_interview_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  tips TEXT,
  common_questions TEXT[],
  duration_estimate TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_interview_stages ENABLE ROW LEVEL SECURITY;

-- Add timestamp trigger
CREATE TRIGGER update_partner_interview_stages_updated_at
  BEFORE UPDATE ON public.partner_interview_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create policies
CREATE POLICY "Admins can manage all interview stages"
  ON public.partner_interview_stages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can manage own interview stages"
  ON public.partner_interview_stages FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Public can view interview stages"
  ON public.partner_interview_stages FOR SELECT
  TO anon, authenticated
  USING (
    partner_id IN (
      SELECT id FROM public.partner_profiles 
      WHERE verification_status = 'verified' AND is_visible = true AND is_approved = true
    )
  );

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
