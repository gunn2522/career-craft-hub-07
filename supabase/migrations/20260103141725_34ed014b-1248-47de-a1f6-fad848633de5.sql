-- Add responsibilities column to careers table for dynamic "What You'll Do" content
ALTER TABLE public.careers 
ADD COLUMN responsibilities text[] DEFAULT '{}'::text[];