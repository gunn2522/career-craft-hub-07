
-- Create email_verifications table for server-side OTP storage
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Only the service role (edge functions) can access this table
-- No client-side access allowed
CREATE POLICY "No direct client access"
ON public.email_verifications
FOR ALL
TO authenticated, anon
USING (false);

-- Index for lookups
CREATE INDEX idx_email_verifications_user_id ON public.email_verifications(user_id, used, expires_at);

-- Also ensure mentor_profiles email_verified cannot be set by the mentor themselves
-- Drop any existing policy that allows mentors to update email_verified
-- The update should only happen via the edge function using service role
