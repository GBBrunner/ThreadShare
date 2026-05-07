-- Post likes table (many-to-many)
CREATE TABLE post_likes (
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id                 UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX ON post_likes (user_id);
CREATE INDEX ON post_likes (post_id);

-- Trigger to keep likesCount in sync
CREATE FUNCTION update_likes_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET "likesCount" = "likesCount" + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET "likesCount" = "likesCount" - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();
