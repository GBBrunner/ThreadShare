CREATE TABLE student_courses (
    user_id   UUID NOT NULL,
    course_id UUID NOT NULL,

    PRIMARY KEY (user_id, course_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE
);
-- The student_id and course_code are not in join table — those are labels, not identities.

-- Example of how to insert into student_courses
INSERT INTO student_courses (user_id, course_id)
SELECT s.user_id, c.course_id
FROM students s
JOIN courses c
  ON s.student_id  = 123456
 AND c.course_code = 'CSCI-1001';
 
-- Example of how to get all courses for a student (by student_id)
SELECT
    c.course_code,
    c.title
FROM student_courses sc
JOIN students s ON sc.user_id = s.user_id
JOIN courses c  ON sc.course_id = c.course_id
WHERE s.student_id = 123456;

-- Example of getting all courses for a student (by student_id)
SELECT
    s.student_id,
    s.full_name
FROM student_courses sc
JOIN students s ON sc.user_id = s.user_id
JOIN courses c  ON sc.course_id = c.course_id
WHERE c.course_code = 'CSCI-1001';


