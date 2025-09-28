-- Add settings columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS poll_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(public_profile) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS idx_profiles_theme ON profiles(theme);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);

-- Update RLS policies to allow users to update their own settings
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to view public profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (public_profile = true OR auth.uid() = id);
