-- Migration to resolve RLS Disabled in Public errors for settings and public_found_reports
-- This ensures the database is secure while maintaining functionality

-- 0. ENSURE ADMIN CHECK FUNCTION EXISTS
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO anon;

-- 1. FIX SETTINGS TABLE
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view site settings (site name, description, etc.)
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings" ON public.settings
FOR SELECT 
TO public
USING (true);

-- Policy: Only admins can perform any other action (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings
FOR ALL
TO authenticated
USING (public.is_admin_check() = true)
WITH CHECK (public.is_admin_check() = true);


-- 2. FIX PUBLIC_FOUND_REPORTS TABLE
ALTER TABLE public.public_found_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Public/Anonymous can insert new reports
DROP POLICY IF EXISTS "Public can insert found reports" ON public.public_found_reports;
CREATE POLICY "Public can insert found reports" 
ON public.public_found_reports FOR INSERT 
TO public
WITH CHECK (true);

-- Policy: Authenticated users can view reports they personally submitted
DROP POLICY IF EXISTS "Users can view their own reports" ON public.public_found_reports;
CREATE POLICY "Users can view their own reports" 
ON public.public_found_reports FOR SELECT 
TO authenticated
USING (auth.uid() = finder_id);

-- Policy: Admins have full access to manage all reports
DROP POLICY IF EXISTS "Admins can manage found reports" ON public.public_found_reports;
CREATE POLICY "Admins can manage found reports" 
ON public.public_found_reports FOR ALL 
TO authenticated
USING (public.is_admin_check() = true)
WITH CHECK (public.is_admin_check() = true);
