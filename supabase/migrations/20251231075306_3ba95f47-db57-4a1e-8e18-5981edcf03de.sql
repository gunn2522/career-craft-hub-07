-- Add price columns to programs table
ALTER TABLE public.programs 
ADD COLUMN is_free boolean DEFAULT true,
ADD COLUMN price decimal(10,2) DEFAULT 0,
ADD COLUMN currency text DEFAULT 'INR';

-- Create program_registrations table
CREATE TABLE public.program_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_amount decimal(10,2),
  payment_reference text,
  reminder_count integer DEFAULT 0,
  last_reminder_sent timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.program_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own registrations"
ON public.program_registrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
ON public.program_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
ON public.program_registrations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations"
ON public.program_registrations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_program_registrations_updated_at
BEFORE UPDATE ON public.program_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();