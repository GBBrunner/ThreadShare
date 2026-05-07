-- Add commentsCount to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "commentsCount" INTEGER NOT NULL DEFAULT 0;

-- Post comments table (one comment per user per post)
CREATE TABLE post_comments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id                 UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content                 TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id)
);

CREATE INDEX ON post_comments (post_id);
CREATE INDEX ON post_comments (user_id);

-- Trigger to keep commentsCount in sync
CREATE FUNCTION update_comments_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET "commentsCount" = "commentsCount" + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET "commentsCount" = "commentsCount" - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();
