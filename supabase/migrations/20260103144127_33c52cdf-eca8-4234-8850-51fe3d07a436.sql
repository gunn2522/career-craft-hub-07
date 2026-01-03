-- Add slug column to careers table
ALTER TABLE public.careers 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_career_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Only generate slug if it's null/empty or title changed
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    IF TG_OP = 'UPDATE' AND OLD.title = NEW.title THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Start with base slug
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.careers WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate slug on insert/update
DROP TRIGGER IF EXISTS generate_career_slug_trigger ON public.careers;
CREATE TRIGGER generate_career_slug_trigger
BEFORE INSERT OR UPDATE ON public.careers
FOR EACH ROW
EXECUTE FUNCTION public.generate_career_slug();

-- Update existing careers to have slugs
UPDATE public.careers 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;