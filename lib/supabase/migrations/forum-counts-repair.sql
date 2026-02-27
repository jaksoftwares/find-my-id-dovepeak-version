
-- 1. Recalculate all comment counts to ensure accuracy
UPDATE forum_posts p
SET comments_count = (
    SELECT count(*)
    FROM forum_comments c
    WHERE c.post_id = p.id
);

-- 2. Recalculate all like counts
UPDATE forum_posts p
SET likes_count = (
    SELECT count(*)
    FROM forum_likes l
    WHERE l.post_id = p.id AND l.vote_type = 'like'
);

-- 3. Recalculate all dislike counts
UPDATE forum_posts p
SET dislikes_count = (
    SELECT count(*)
    FROM forum_likes l
    WHERE l.post_id = p.id AND l.vote_type = 'dislike'
);

-- 4. Ensure triggers are robust (use COALESCE to avoid NULL issues)
CREATE OR REPLACE FUNCTION increment_forum_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_forum_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
