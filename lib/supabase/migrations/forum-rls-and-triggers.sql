
-- 1. Forum Posts Policies
DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
CREATE POLICY "Anyone can view forum posts"
ON forum_posts FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
CREATE POLICY "Authenticated users can create posts"
ON forum_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own posts" ON forum_posts;
CREATE POLICY "Authors can update their own posts"
ON forum_posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors or admins can delete posts" ON forum_posts;
CREATE POLICY "Authors or admins can delete posts"
ON forum_posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin_check());

-- 2. Forum Comments Policies
DROP POLICY IF EXISTS "Anyone can view forum comments" ON forum_comments;
CREATE POLICY "Anyone can view forum comments"
ON forum_comments FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON forum_comments;
CREATE POLICY "Authenticated users can create comments"
ON forum_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own comments" ON forum_comments;
CREATE POLICY "Authors can update their own comments"
ON forum_comments FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors or admins can delete comments" ON forum_comments;
CREATE POLICY "Authors or admins can delete comments"
ON forum_comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin_check());

-- 3. Forum Likes Policies
DROP POLICY IF EXISTS "Anyone can view forum likes" ON forum_likes;
CREATE POLICY "Anyone can view forum likes"
ON forum_likes FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage their own likes" ON forum_likes;
CREATE POLICY "Authenticated users can manage their own likes"
ON forum_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DB Triggers for automatic counts (Optimization)
-- Increment comments_count on insert
CREATE OR REPLACE FUNCTION increment_forum_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_forum_comments_count ON forum_comments;
CREATE TRIGGER tr_increment_forum_comments_count
AFTER INSERT ON forum_comments
FOR EACH ROW EXECUTE FUNCTION increment_forum_comments_count();

-- Decrement comments_count on delete
CREATE OR REPLACE FUNCTION decrement_forum_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_decrement_forum_comments_count ON forum_comments;
CREATE TRIGGER tr_decrement_forum_comments_count
AFTER DELETE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION decrement_forum_comments_count();

-- Synchronize likes_count
CREATE OR REPLACE FUNCTION update_forum_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE forum_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_forum_likes_count ON forum_likes;
CREATE TRIGGER tr_update_forum_likes_count
AFTER INSERT OR DELETE ON forum_likes
FOR EACH ROW EXECUTE FUNCTION update_forum_likes_count();
