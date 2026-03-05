CREATE OR REPLACE FUNCTION public.validate_ambassador_application()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only validate user_id ownership on INSERT (not admin UPDATE)
  IF TG_OP = 'INSERT' THEN
    -- Ensure user_id is set and matches the authenticated user
    IF NEW.user_id IS NULL THEN
      RAISE EXCEPTION 'user_id is required for ambassador applications';
    END IF;
    
    -- CRITICAL: Validate that user_id matches the authenticated user (prevents user_id manipulation)
    IF NEW.user_id != auth.uid() THEN
      RAISE EXCEPTION 'user_id must match authenticated user - access denied';
    END IF;
  END IF;
  
  -- On UPDATE by admin, skip ownership check but still sanitize
  IF TG_OP = 'UPDATE' THEN
    -- If user_id is being changed, only the owner can do that
    IF NEW.user_id != OLD.user_id THEN
      RAISE EXCEPTION 'Cannot change application ownership';
    END IF;
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
$function$;