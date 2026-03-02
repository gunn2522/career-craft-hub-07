
-- ============================================================
-- FIX 1: Harden handle_new_user() to validate user_type and add input limits
-- Only assign 'user' role by default. Mentor/partner roles require valid enum.
-- Add length limits and sanitization for metadata fields.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_type_val text;
  role_to_assign app_role;
  safe_full_name text;
  safe_institution text;
  safe_user_type public.user_type;
BEGIN
  user_type_val := NEW.raw_user_meta_data ->> 'user_type';
  
  -- Validate and sanitize full_name (max 100 chars, strip HTML)
  safe_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name');
  IF safe_full_name IS NOT NULL THEN
    safe_full_name := regexp_replace(safe_full_name, '<[^>]*>', '', 'g');
    safe_full_name := left(safe_full_name, 100);
  END IF;
  
  -- Validate and sanitize institution (max 200 chars, strip HTML)
  safe_institution := NEW.raw_user_meta_data ->> 'institution';
  IF safe_institution IS NOT NULL THEN
    safe_institution := regexp_replace(safe_institution, '<[^>]*>', '', 'g');
    safe_institution := left(safe_institution, 200);
  END IF;
  
  -- Validate user_type against allowed enum values
  -- Only allow the 4 valid types; default to 'college_student'
  IF user_type_val IN ('school_student', 'college_student', 'mentor', 'partner') THEN
    safe_user_type := user_type_val::public.user_type;
  ELSE
    safe_user_type := 'college_student'::public.user_type;
  END IF;
  
  -- Determine role based on validated user_type
  IF user_type_val = 'mentor' THEN
    role_to_assign := 'mentor';
  ELSIF user_type_val = 'partner' THEN
    role_to_assign := 'partner';
  ELSE
    role_to_assign := 'user';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, user_type, institution)
  VALUES (
    NEW.id,
    safe_full_name,
    NEW.email,
    safe_user_type,
    safe_institution
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_to_assign);
  
  -- Create mentor profile if mentor (unverified by default - requires admin approval)
  IF user_type_val = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  -- Create partner profile if partner (unverified by default - requires admin approval)
  IF user_type_val = 'partner' THEN
    INSERT INTO public.partner_profiles (user_id, company_name)
    VALUES (NEW.id, safe_institution);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================================
-- FIX 2: Replace overly permissive mentor_profiles SELECT policy
-- Only allow: verified mentors public, own profile, admin all
-- ============================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view mentor profiles" ON public.mentor_profiles;

-- Public/anon can only see verified mentors
CREATE POLICY "Public can view verified mentors"
ON public.mentor_profiles
FOR SELECT
TO anon, authenticated
USING (verification_status = 'verified');

-- Mentors can always view their own profile
CREATE POLICY "Mentors view own profile"
ON public.mentor_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all mentor profiles
CREATE POLICY "Admins view all mentor profiles"
ON public.mentor_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
