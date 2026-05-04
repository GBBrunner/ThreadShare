const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// GET /api/Enroll_Course?student_id=UUID
// Fetch all courses with optional enrollment status for a student
router.get('/Enroll_Course', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.query;

    // Fetch all courses from the database
    const coursesResult = await pool.query(
      'SELECT course_id, course_code, course_title, course_desc, room_number, capacity, credits, tuition_cost, created_at, updated_at FROM courses ORDER BY course_code ASC'
    );
    const courses = coursesResult.rows;

    // If a student_id is provided, mark which courses the student is already enrolled in
    if (student_id) {
      const enrolledResult = await pool.query(
        'SELECT course_id FROM student_courses WHERE user_id = $1',
        [student_id]
      );
      const enrolledSet = new Set(enrolledResult.rows.map((r) => r.course_id));
      const enrichedCourses = courses.map((course) => ({
        ...course,
        is_enrolled: enrolledSet.has(course.course_id),
      }));
      return res.status(200).json(enrichedCourses);
    }

    // No student_id provided, return plain courses without enrollment status
    return res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Enroll a user into multiple courses at once
// Expects: { user_id: UUID, course_ids: UUID[] }
router.post('/Enroll_Course', authenticateToken, async (req, res) => {
  try {
    // Using the user_id and the selected course_ids from the form sumbitted by the user
    const { user_id, course_ids } = req.body;
    // Validate the input
    if (!user_id){
      return res.status(400).json({ error: 'Please provide a valid user ID' });
    }
    // Ensure course_ids is returned as an array and at least one course_id is provided
    if (!Array.isArray(course_ids) || course_ids.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid course ID' });
    }
    // Don't add courses that the user is already enrolled in.
    // This prevents duplicate entries in the student_courses table,
    // This is also for the UX so the user can get feedback if they attempt to enroll in a course already enrolled in
    const alreadyEnrolled = await pool.query(
        'SELECT course_id FROM student_courses WHERE user_id = $1 AND course_id = ANY($2::uuid[])',
        [user_id, course_ids]
    );
    const alreadyEnrolledIds = alreadyEnrolled.rows.map(row => row.course_id);

    // Insert the new course enrollments, ignoring duplicates via ON CONFLICT
    const insertQuery = `
        INSERT INTO student_courses (user_id, course_id)
        SELECT $1::uuid, unnest($2::uuid[])
        ON CONFLICT DO NOTHING
        RETURNING course_id
    `;
    // return the course_ids that were successfully inserted 
    // and the course_ids that were already enrolled in for feedback to the user
    const insertResult = await pool.query(insertQuery, [user_id, course_ids]);
    return res.status(201).json({
        message: 'Enrollment processed.',
        insertedCount: insertResult.rowCount,
        alreadyEnrolledIds,
    });
} catch (err) {
    console.error('Error enrolling courses:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});
router.delete('/Enroll_Course', authenticateToken, async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        if (!user_id || !course_id) {
            return res.status(400).json({ message: 'user_id and course_id are required.' });
        }
        const deleteQuery = 'DELETE FROM student_courses WHERE user_id = $1 AND course_id = $2';
        const deleteResult = await pool.query(deleteQuery, [user_id, course_id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Enrollment not found.' });
        }
        return res.status(200).json({ message: 'Enrollment deleted successfully.' });
    } catch (err) {
        console.error('Error deleting enrollment:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
module.exports = router;