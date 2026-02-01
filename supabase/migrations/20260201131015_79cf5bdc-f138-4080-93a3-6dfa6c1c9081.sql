-- Create legal_pages table for Privacy Policy, Terms of Service, Refund Policy
CREATE TABLE public.legal_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Public read access for published pages
CREATE POLICY "Anyone can view published legal pages"
  ON public.legal_pages
  FOR SELECT
  USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage legal pages"
  ON public.legal_pages
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default pages
INSERT INTO public.legal_pages (page_key, title, content) VALUES
  ('privacy', 'Privacy Policy', 'Your privacy policy content goes here.'),
  ('terms', 'Terms of Service', 'Your terms of service content goes here.'),
  ('refund', 'Refund Policy', 'Your refund policy content goes here.');