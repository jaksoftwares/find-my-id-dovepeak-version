
-- Allow admins to update any forum post
DROP POLICY IF EXISTS "Admins can update any post" ON forum_posts;
CREATE POLICY "Admins can update any post"
ON forum_posts FOR UPDATE
TO authenticated
USING (public.is_admin_check())
WITH CHECK (public.is_admin_check());

-- Allow admins to update any forum comment 
DROP POLICY IF EXISTS "Admins can update any comment" ON forum_comments;
CREATE POLICY "Admins can update any comment"
ON forum_comments FOR UPDATE
TO authenticated
USING (public.is_admin_check())
WITH CHECK (public.is_admin_check());
