-- Enums
CREATE TYPE category_type  AS ENUM ('tops', 'bottoms', 'dresses', 'shoes', 'sweaters', 'accessories', 'other');
CREATE TYPE condition_type AS ENUM ('newWithTags', 'likeNew', 'good', 'worn');
CREATE TYPE occasion_type  AS ENUM ('formal', 'business', 'casual', 'everyday', 'vacation', 'work', 'gym', 'sports', 'party', 'swimwear', 'outerwear', 'other');

-- Posts table
CREATE TABLE posts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                   TEXT NOT NULL,
    description             TEXT,
    brand                   TEXT,
    size                    TEXT,
    category                category_type,
    condition               condition_type,
    color                   TEXT,
    occasions               occasion_type[]  NOT NULL DEFAULT '{}',
    images                  TEXT[]           NOT NULL DEFAULT '{}',  -- up to 5 image filenames/URLs
    "likesCount"            INTEGER          NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX ON posts (user_id);
CREATE INDEX ON posts (created_at DESC);
