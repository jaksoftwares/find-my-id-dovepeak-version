-- Fix RLS policies for notifications and audit logs
-- This ensures admins can insert rows regardless of the data

-- 1. Redefine is_admin_check to be more robust
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Fix notifications policies
DROP POLICY IF EXISTS "Admins view all notifications" ON notifications;
CREATE POLICY "Admins full access notifications"
ON notifications
FOR ALL
USING (public.is_admin_check() = true)
WITH CHECK (public.is_admin_check() = true);

-- Add update/delete for users own notifications
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications"
ON notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Fix audit_logs policies
DROP POLICY IF EXISTS "Admins view all audit logs" ON audit_logs;
CREATE POLICY "Admins full access audit logs"
ON audit_logs
FOR ALL
USING (public.is_admin_check() = true)
WITH CHECK (public.is_admin_check() = true);

-- 4. Fix submissions policies
DROP POLICY IF EXISTS "Admins manage all submissions" ON submissions;
CREATE POLICY "Admins full access submissions"
ON submissions
FOR ALL
USING (public.is_admin_check() = true)
WITH CHECK (public.is_admin_check() = true);

-- 5. Fix forum policies (if any)
-- Check if forum_posts has admin policy
DROP POLICY IF EXISTS "Admins manage forum posts" ON forum_posts;
CREATE POLICY "Admins manage forum posts"
ON forum_posts
FOR ALL
USING (public.is_admin_check() = true)
WITH CHECK (public.is_admin_check() = true);

-- Grant execute again just in case
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO anon;
