-- Migration to add email column to profiles for efficient notifications
-- This syncs the email from auth.users to profiles table

DO $$ 
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Update existing profiles with emails from auth.users
-- This requires trigger or manual backfill. 
-- Since we are in a migration, we can try to do a direct update if we have permissions
UPDATE profiles
SET email = u.email
FROM auth.users u
WHERE profiles.id = u.id AND (profiles.email IS NULL OR profiles.email <> u.email);

-- Ensure the trigger also syncs email on new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add extra columns to notifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'info';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link') THEN
        ALTER TABLE notifications ADD COLUMN link TEXT;
    END IF;
END $$;
