-- Add bio column to profiles table
-- Run this in your Supabase SQL editor

-- Add bio column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text;

-- Update the profiles table comment
COMMENT ON COLUMN public.profiles.bio IS 'User bio/description';

-- Create an index on bio for search functionality (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_bio ON public.profiles(bio) WHERE bio IS NOT NULL;
