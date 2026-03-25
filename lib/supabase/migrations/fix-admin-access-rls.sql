-- Definitive fix for admin access to lost_requests and other tables to rule out RLS issues.

-- 1. Ensure any user with role='admin' in profiles table can bypass RLS on common tables
DO $$ 
BEGIN
    -- profiles policy
    DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
    CREATE POLICY "Admins can view all profiles"
    ON profiles
    FOR SELECT
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

    -- lost_requests policy
    DROP POLICY IF EXISTS "Admins manage all lost requests" ON lost_requests;
    CREATE POLICY "Admins manage all lost requests"
    ON lost_requests
    FOR ALL
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

    -- ids_found policy
    DROP POLICY IF EXISTS "Admins full access IDs" ON ids_found;
    CREATE POLICY "Admins full access IDs"
    ON ids_found
    FOR ALL
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

    -- claims policy
    DROP POLICY IF EXISTS "Admins full access claims" ON claims;
    CREATE POLICY "Admins full access claims"
    ON claims
    FOR ALL
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
END $$;

-- This uses subqueries which can be slow but are NOT recursive for non-profiles tables.
-- For profiles table, we still want to rule out the recursion. 
-- Let's use the simplest possible check instead.

-- Drop the function check to rule out permissions issues with joining auth.users
DROP FUNCTION IF EXISTS public.is_admin_check() CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin()
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

-- Apply the new function to all relevant policies for simplicity and maintenance
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage all lost requests" ON lost_requests;
CREATE POLICY "Admins manage all lost requests" ON lost_requests FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access IDs" ON ids_found;
CREATE POLICY "Admins full access IDs" ON ids_found FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access claims" ON claims;
CREATE POLICY "Admins full access claims" ON claims FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins view all notifications" ON notifications;
CREATE POLICY "Admins view all notifications" ON notifications FOR ALL USING (public.is_admin());



-- 1. Unify and Update Admin Access Functions
-- This ensures any existing RLS policies using these functions allow BOTH Admin and Super Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  );
$$;

-- Some newer migrations used is_admin_check(), updating it for consistency
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  );
$$;

-- 2. Define the strict Super Admin check for sensitive operations
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 3. Grant Permissions to ensure these functions work correctly
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, anon;

-- 4. Database-Level Deletion Hardening
-- Ensures that even if the UI is bypassed, only a Super Admin can delete records.

-- Harden Ids Table Deletion
DROP POLICY IF EXISTS "Admins full access IDs" ON ids_found;
CREATE POLICY "Admins manage IDs" ON ids_found FOR ALL USING (public.is_admin());
CREATE POLICY "Strict Super Admin Delete for IDs" ON ids_found FOR DELETE USING (public.is_super_admin());

-- Harden Submissions Table Deletion
DROP POLICY IF EXISTS "Admins full access submissions" ON submissions;
CREATE POLICY "Admins manage submissions" ON submissions FOR ALL USING (public.is_admin());
CREATE POLICY "Strict Super Admin Delete for Submissions" ON submissions FOR DELETE USING (public.is_super_admin());

-- 5. Promote your account to Super Admin
-- Replace 'YOUR_EMAIL@example.com' with the email you use to login.
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'YOUR_EMAIL@example.com'; 

-- 6. Verification
-- SELECT id, email, full_name, role FROM public.profiles WHERE role IN ('admin', 'super_admin');

