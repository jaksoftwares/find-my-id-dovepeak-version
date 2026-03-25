-- SQL Migration Script for Role-Based Access Control
-- Run this in your Supabase SQL Editor

-- 1. Update the user_role enum to include 'super_admin'
-- This handles cases where an enum was used.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    END IF;
END
$$;

-- 2. Update the profiles table role check constraint 
-- If your table uses a check constraint instead of an enum, run this:
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'staff', 'admin', 'super_admin'));

-- 3. Update existing admin(s) to super_admin 
-- IMPORTANT: Provide the email of the person who should be the Super Admin
-- UPDATE public.profiles 
-- SET role = 'super_admin' 
-- WHERE email = 'YOUR_SUPER_ADMIN_EMAIL@example.com'; 

-- 4. Verify the changes
-- SELECT id, email, full_name, role FROM public.profiles WHERE role IN ('admin', 'super_admin');
