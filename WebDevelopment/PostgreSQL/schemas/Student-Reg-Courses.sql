CREATE TABLE courses (
---- Identification
	course_id		UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	course_code		VARCHAR(20) NOT NULL CHECK (course_code = UPPER(course_code)),
    course_title	VARCHAR(150) NOT NULL,
---- Information
    course_desc		TEXT DEFAULT 'No Course Description Given',
	room_number		VARCHAR(20) NOT NULL CHECK (room_number = UPPER(room_number)),
	capacity		SMALLINT DEFAULT 24,
	credits			SMALLINT DEFAULT 1,
	tuition_cost	NUMERIC(12, 2) DEFAULT 0.00 CHECK (tuition_cost >= 0),
---- Timestamps
    created_at		TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at		TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM courses

-- DROP Table courses

CREATE UNIQUE INDEX idx_courses_code ON courses (course_code);
CREATE INDEX idx_courses_title ON courses (course_title);
CREATE INDEX idx_courses_created_at ON courses (created_at DESC);

COPY courses(course_code, course_title, course_desc, room_number, capacity, credits, tuition_cost)
FROM 'C:/Users/GBbru/Documents/GitHub/TEWP 1050 Deployment and Security/queries/postgres/cleaned_courses.csv' 
WITH (FORMAT CSV, HEADER);