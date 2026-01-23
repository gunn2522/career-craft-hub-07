-- Add mentor and partner to the user_type enum
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'mentor';
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'partner';