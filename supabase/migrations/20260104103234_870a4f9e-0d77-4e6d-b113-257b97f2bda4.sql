-- Add 'partner' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';

-- Create partners table for company/industry partners
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  partner_type text DEFAULT 'industry', -- hiring, training, industry
  description text,
  is_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- RLS policies for partners
CREATE POLICY "Anyone can view visible partners"
ON public.partners
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can manage partners"
ON public.partners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create partner_profiles table for partner users
CREATE TABLE public.partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  company_name text,
  company_website text,
  company_description text,
  industry text,
  jobs_posted integer DEFAULT 0,
  students_engaged integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for partner_profiles
CREATE POLICY "Users can view their own partner profile"
ON public.partner_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partner profile"
ON public.partner_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner profile"
ON public.partner_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all partner profiles"
ON public.partner_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create mentor_profiles table for mentor-specific data
CREATE TABLE public.mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  expertise text[],
  years_of_experience integer DEFAULT 0,
  specialization text,
  students_mentored integer DEFAULT 0,
  sessions_conducted integer DEFAULT 0,
  availability_status text DEFAULT 'available', -- available, busy, offline
  hourly_rate numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_profiles
CREATE POLICY "Anyone can view mentor profiles"
ON public.mentor_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own mentor profile"
ON public.mentor_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile"
ON public.mentor_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all mentor profiles"
ON public.mentor_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add status column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Add profile_completed column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'profile_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add current_level column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'current_level') THEN
    ALTER TABLE public.profiles ADD COLUMN current_level text; -- school, college, working_professional, founder
  END IF;
END $$;

-- Add short_term_goals and long_term_goals to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'short_term_goals') THEN
    ALTER TABLE public.profiles ADD COLUMN short_term_goals text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'long_term_goals') THEN
    ALTER TABLE public.profiles ADD COLUMN long_term_goals text;
  END IF;
END $$;

-- Update handle_new_user function to set proper role based on user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_type_val text;
  role_to_assign app_role;
BEGIN
  user_type_val := NEW.raw_user_meta_data ->> 'user_type';
  
  -- Determine role based on user_type
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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'college_student'),
    NEW.raw_user_meta_data ->> 'institution'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_to_assign);
  
  -- Create mentor profile if mentor
  IF user_type_val = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  -- Create partner profile if partner
  IF user_type_val = 'partner' THEN
    INSERT INTO public.partner_profiles (user_id, company_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'institution');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_partner_profiles_updated_at
BEFORE UPDATE ON public.partner_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_mentor_profiles_updated_at
BEFORE UPDATE ON public.mentor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();