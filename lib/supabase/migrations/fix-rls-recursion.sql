-- Fix recursive RLS policies causing stack depth limit exceeded
-- This script fixes the infinite recursion in profile policies

-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a non-recursive function to check admin role
-- This function uses STABLE volatility to prevent recursion
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE u.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Create simpler user policy - users can view their own profile
-- This doesn't trigger recursion
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Create admin policy using the non-recursive function
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (public.is_admin_check() = true);

-- Also fix other tables that might have similar issues

-- Fix ids_found policies
DROP POLICY IF EXISTS "Public can view verified IDs" ON ids_found;
DROP POLICY IF EXISTS "Admins full access IDs" ON ids_found;

CREATE POLICY "Public can view verified IDs"
ON ids_found
FOR SELECT
USING (status = 'verified' AND visibility = true);

CREATE POLICY "Admins full access IDs"
ON ids_found
FOR ALL
USING (public.is_admin_check() = true);

-- Fix lost_requests policies
DROP POLICY IF EXISTS "Users manage own lost requests" ON lost_requests;
DROP POLICY IF EXISTS "Admins manage all lost requests" ON lost_requests;

CREATE POLICY "Users manage own lost requests"
ON lost_requests
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins manage all lost requests"
ON lost_requests
FOR ALL
USING (public.is_admin_check() = true);

-- Fix claims policies
DROP POLICY IF EXISTS "Users view own claims" ON claims;
DROP POLICY IF EXISTS "Admins full access claims" ON claims;

CREATE POLICY "Users view own claims"
ON claims
FOR SELECT
USING (claimant = auth.uid());

CREATE POLICY "Admins full access claims"
ON claims
FOR ALL
USING (public.is_admin_check() = true);

-- Fix notifications policies (if needed)
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins view all notifications" ON notifications;

CREATE POLICY "Users view own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins view all notifications"
ON notifications
FOR ALL
USING (public.is_admin_check() = true);

-- Fix submissions policies
DROP POLICY IF EXISTS "Users manage own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins manage all submissions" ON submissions;

CREATE POLICY "Users manage own submissions"
ON submissions
FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = submitted_by AND id = auth.uid())
  OR public.is_admin_check() = true
);

CREATE POLICY "Admins manage all submissions"
ON submissions
FOR ALL
USING (public.is_admin_check() = true);

-- Fix audit_logs policies
DROP POLICY IF EXISTS "Users view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins view all audit logs" ON audit_logs;

CREATE POLICY "Users view own audit logs"
ON audit_logs
FOR SELECT
USING (actor = auth.uid());

CREATE POLICY "Admins view all audit logs"
ON audit_logs
FOR SELECT
USING (public.is_admin_check() = true);

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO anon;

-- Create index on profiles.role for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
