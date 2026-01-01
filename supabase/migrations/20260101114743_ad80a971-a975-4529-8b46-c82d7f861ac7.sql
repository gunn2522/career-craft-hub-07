-- Add a trigger to validate and protect ambassador application data
-- This ensures data integrity at the database level

-- Create a validation function for ambassador applications
CREATE OR REPLACE FUNCTION public.validate_ambassador_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user_id is set and matches the authenticated user (extra layer beyond RLS)
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required for ambassador applications';
  END IF;
  
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate phone format if provided (Indian format or international)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' AND 
     NEW.phone !~ '^\+?[0-9]{10,15}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  -- Sanitize text fields - remove potential script tags
  NEW.full_name := regexp_replace(NEW.full_name, '<[^>]*>', '', 'g');
  NEW.college := regexp_replace(NEW.college, '<[^>]*>', '', 'g');
  IF NEW.why_ambassador IS NOT NULL THEN
    NEW.why_ambassador := regexp_replace(NEW.why_ambassador, '<[^>]*>', '', 'g');
  END IF;
  
  -- Limit field lengths to prevent abuse
  IF length(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Full name exceeds maximum length of 100 characters';
  END IF;
  
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email exceeds maximum length of 255 characters';
  END IF;
  
  IF NEW.college IS NOT NULL AND length(NEW.college) > 200 THEN
    RAISE EXCEPTION 'College name exceeds maximum length of 200 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_ambassador_application_trigger ON public.ambassador_applications;
CREATE TRIGGER validate_ambassador_application_trigger
BEFORE INSERT OR UPDATE ON public.ambassador_applications
FOR EACH ROW
EXECUTE FUNCTION public.validate_ambassador_application();

-- Add a constraint to ensure user_id is NOT NULL for new applications
-- This provides an additional layer of protection
ALTER TABLE public.ambassador_applications 
ALTER COLUMN user_id SET NOT NULL;