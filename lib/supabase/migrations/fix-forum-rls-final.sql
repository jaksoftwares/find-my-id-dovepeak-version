
-- 1. Create a stable is_admin_check function that won't be dropped easily
-- and matches what many policies expect
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

-- 2. Ensure the forum_posts table has RLS enabled
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- 3. DROP old problematic policies
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Create posts policy" ON public.forum_posts;

-- 4. CREATE a comprehensive INSERT policy
-- This allows:
-- A) Admins to create ANY post
-- B) Authenticated users to ONLY create thoughts as themselves
CREATE POLICY "Forum creation policy"
ON public.forum_posts
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = author_id -- Must be the author
    AND (
        public.is_admin_check() -- Admins can post anywhere
        OR category = 'Member Thoughts' -- Users can ONLY post in 'Member Thoughts'
    )
);

-- 5. FIX UPDATE POLICY (authors or admins)
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins and authors can update posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.forum_posts;

CREATE POLICY "Forum update policy"
ON public.forum_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin_check())
WITH CHECK (auth.uid() = author_id OR public.is_admin_check());

-- 6. FIX DELETE POLICY (authors or admins)
DROP POLICY IF EXISTS "Authors or admins can delete posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.forum_posts;

CREATE POLICY "Forum delete policy"
ON public.forum_posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin_check());

-- 7. RE-VERIFY VIEW POLICY
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
CREATE POLICY "Forum view policy"
ON public.forum_posts
FOR SELECT
TO anon, authenticated
USING (true);

-- 8. EXTEND TO COMMENTS (similarly)
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Create comments policy" ON public.forum_comments;

CREATE POLICY "Forum comments creation policy"
ON public.forum_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors or admins can delete comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Admins can update any comment" ON public.forum_comments;

CREATE POLICY "Forum comments management policy"
ON public.forum_comments
FOR ALL
TO authenticated
USING (auth.uid() = author_id OR public.is_admin_check())
WITH CHECK (auth.uid() = author_id OR public.is_admin_check());
