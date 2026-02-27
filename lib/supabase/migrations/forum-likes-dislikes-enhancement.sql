
-- 1. Extend Forum Tables with Dislike Counts
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0;

-- 2. Create Vote Type Enum if not exists
DO $$ BEGIN
    CREATE TYPE forum_vote_type AS ENUM ('like', 'dislike');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Migration: Update Post Likes to include Type
-- If forum_likes doesn't have 'vote_type', we add it. 
-- For simplicity, let's keep the name 'forum_likes' but treat it as 'forum_votes'.
ALTER TABLE forum_likes ADD COLUMN IF NOT EXISTS vote_type forum_vote_type DEFAULT 'like';

-- 4. Create Comment Interactions Table
CREATE TABLE IF NOT EXISTS forum_comment_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type forum_vote_type NOT NULL DEFAULT 'like',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

ALTER TABLE forum_comment_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comment votes" ON forum_comment_votes;
CREATE POLICY "Anyone can view comment votes" ON forum_comment_votes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage own comment votes" ON forum_comment_votes;
CREATE POLICY "Users can manage own comment votes" ON forum_comment_votes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Updated Triggers for Posts (Handles Like and Dislike)
CREATE OR REPLACE FUNCTION update_forum_post_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.vote_type = 'like') THEN
            UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSE
            UPDATE forum_posts SET dislikes_count = dislikes_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.vote_type = 'like') THEN
            UPDATE forum_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
        ELSE
            UPDATE forum_posts SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.post_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.vote_type = NEW.vote_type) THEN RETURN NEW; END IF; -- No change in type
        
        IF (NEW.vote_type = 'like') THEN
            UPDATE forum_posts SET likes_count = likes_count + 1, dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = NEW.post_id;
        ELSE
            UPDATE forum_posts SET dislikes_count = dislikes_count + 1, likes_count = GREATEST(0, likes_count - 1) WHERE id = NEW.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_forum_post_votes_count ON forum_likes;
CREATE TRIGGER tr_update_forum_post_votes_count
AFTER INSERT OR DELETE OR UPDATE ON forum_likes
FOR EACH ROW EXECUTE FUNCTION update_forum_post_votes_count();

-- 6. Triggers for Comments
CREATE OR REPLACE FUNCTION update_forum_comment_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.vote_type = 'like') THEN
            UPDATE forum_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        ELSE
            UPDATE forum_comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.vote_type = 'like') THEN
            UPDATE forum_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
        ELSE
            UPDATE forum_comments SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.comment_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.vote_type = NEW.vote_type) THEN RETURN NEW; END IF;
        
        IF (NEW.vote_type = 'like') THEN
            UPDATE forum_comments SET likes_count = likes_count + 1, dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = NEW.comment_id;
        ELSE
            UPDATE forum_comments SET dislikes_count = dislikes_count + 1, likes_count = GREATEST(0, likes_count - 1) WHERE id = NEW.comment_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_forum_comment_votes_count ON forum_comment_votes;
CREATE TRIGGER tr_update_forum_comment_votes_count
AFTER INSERT OR DELETE OR UPDATE ON forum_comment_votes
FOR EACH ROW EXECUTE FUNCTION update_forum_comment_votes_count();
