-- Create programs table
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  duration TEXT,
  features TEXT[] DEFAULT '{}',
  outcomes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage programs" 
ON public.programs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active programs" 
ON public.programs 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for program banners
INSERT INTO storage.buckets (id, name, public) VALUES ('program-banners', 'program-banners', true);

-- Create policies for program banner uploads
CREATE POLICY "Program banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'program-banners');

CREATE POLICY "Admins can upload program banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'program-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update program banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'program-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete program banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'program-banners' AND has_role(auth.uid(), 'admin'::app_role));