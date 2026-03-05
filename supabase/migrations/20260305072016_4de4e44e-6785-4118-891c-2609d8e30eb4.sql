
-- Create sponsorship requests table
CREATE TABLE public.ambassador_sponsorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  expected_participants INTEGER NOT NULL DEFAULT 0,
  event_date DATE,
  event_location TEXT,
  sponsorship_types TEXT[] NOT NULL DEFAULT '{}',
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ambassador_sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Ambassadors can view their own requests
CREATE POLICY "Ambassadors can view own sponsorship requests"
ON public.ambassador_sponsorship_requests FOR SELECT TO authenticated
USING (ambassador_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Ambassadors can insert their own requests
CREATE POLICY "Ambassadors can create sponsorship requests"
ON public.ambassador_sponsorship_requests FOR INSERT TO authenticated
WITH CHECK (ambassador_id = auth.uid());

-- Ambassadors can update their pending requests
CREATE POLICY "Ambassadors can update own pending requests"
ON public.ambassador_sponsorship_requests FOR UPDATE TO authenticated
USING (ambassador_id = auth.uid() AND status = 'pending');

-- Admins can update any request (for approval/rejection)
CREATE POLICY "Admins can update sponsorship requests"
ON public.ambassador_sponsorship_requests FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins can delete requests
CREATE POLICY "Admins can delete sponsorship requests"
ON public.ambassador_sponsorship_requests FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
