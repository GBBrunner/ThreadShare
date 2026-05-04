CREATE TABLE students (
    -- Identification
	creator_id 	  UUID NOT NULL,
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Personal Info
    first_name    VARCHAR(20),
    last_name     VARCHAR(20),
    email         VARCHAR(255) NOT NULL UNIQUE,
    -- Auth & Permissions
    -- password_hash VARCHAR(255) NOT NULL,
    -- user_role     VARCHAR(20) DEFAULT 'user' CHECK (user_role IN ('admin', 'moderator', 'user')),
    -- Timestamps
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- DROP table students
