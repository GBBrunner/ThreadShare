-- Enums
CREATE TYPE relationship_type AS ENUM ('friend', 'follower', 'publicUser');
CREATE TYPE visibility_type AS ENUM ('publicProfile', 'privateProfile', 'friendsOnly');

-- Users table
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   TEXT NOT NULL UNIQUE,
    password_hash           TEXT NOT NULL,
    firstname               TEXT,
    lastname                TEXT,
    "displayName"           TEXT,
    username                TEXT NOT NULL UNIQUE,
    bio                     TEXT,
    "avatarImageName"       TEXT,
    city                    TEXT,
    relationship            relationship_type,
    visibility              visibility_type NOT NULL DEFAULT 'publicProfile',
    "followerCount"         INTEGER NOT NULL DEFAULT 0,
    "followingCount"        INTEGER NOT NULL DEFAULT 0,
    "styleInterests"        TEXT[] NOT NULL DEFAULT '{}',
    "favoriteBrands"        TEXT[] NOT NULL DEFAULT '{}'
);

-- User follows table (many-to-many)
CREATE TABLE user_follows (
    follower_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX ON user_follows (follower_id);
CREATE INDEX ON user_follows (following_id);

-- Trigger to keep follower/following counts in sync
CREATE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET "followerCount"  = "followerCount"  + 1 WHERE id = NEW.following_id;
        UPDATE users SET "followingCount" = "followingCount" + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET "followerCount"  = "followerCount"  - 1 WHERE id = OLD.following_id;
        UPDATE users SET "followingCount" = "followingCount" - 1 WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follow_counts
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
