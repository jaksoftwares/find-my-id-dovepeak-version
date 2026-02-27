
-- 1. Profiles: Allow anyone to view essential profile info (name/role) for the forum
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Also ensure the author join works for comments/posts
DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
CREATE POLICY "Anyone can view forum posts"
ON forum_posts FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view forum comments" ON forum_comments;
CREATE POLICY "Anyone can view forum comments"
ON forum_comments FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admins to create any post, and users to share thoughts
DROP POLICY IF EXISTS "Admins can create posts" ON forum_posts;
CREATE POLICY "Create posts policy"
ON forum_posts FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin_check()
    OR category = 'Member Thoughts'
);

-- 3. Forum Posts: Admins can update any post, authors can update own
DROP POLICY IF EXISTS "Authors can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Admins and authors can update posts" ON forum_posts;
CREATE POLICY "Admins and authors can update posts"
ON forum_posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin_check())
WITH CHECK (auth.uid() = author_id OR public.is_admin_check());
