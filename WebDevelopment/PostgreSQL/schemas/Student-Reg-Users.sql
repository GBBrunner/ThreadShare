CREATE TABLE users (
    -- Identification
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Personal Info
    first_name    VARCHAR(20),
    last_name     VARCHAR(20),
    username      VARCHAR(50) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    -- Auth & Permissions
    password_hash VARCHAR(255) NOT NULL,
    user_role     VARCHAR(20) DEFAULT 'student' CHECK (user_role IN ('admin', 'moderator', 'student')),
    -- Timestamps
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;

-- 1. Change the default value for new rows
ALTER TABLE users 
  ALTER COLUMN user_role SET DEFAULT 'user';

-- 2. Drop the old CHECK constraint 
-- (Note: If you didn't name it, pgAdmin usually names it 'table_column_check')
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_user_role_check;

-- 3. Add the new CHECK constraint
ALTER TABLE users
  ADD CONSTRAINT users_user_role_check 
  CHECK (user_role IN ('admin', 'moderator', 'user', 'student'));

-- 4 Keep track of student ids
CREATE SEQUENCE user_count
    START 100000
    INCREMENT 1
    MINVALUE 100000
    MAXVALUE 999999
    NO CYCLE;
