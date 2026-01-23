-- Create event_gallery table for company event photos
CREATE TABLE public.event_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  event_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Event gallery images are publicly viewable" 
ON public.event_gallery 
FOR SELECT 
USING (is_visible = true);

-- Create admin policies using the has_role function
CREATE POLICY "Admins can manage event gallery" 
ON public.event_gallery 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_event_gallery_updated_at
BEFORE UPDATE ON public.event_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for event gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-gallery', 'event-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event gallery images
CREATE POLICY "Event gallery images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-gallery');

CREATE POLICY "Admins can upload event gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'admin'));