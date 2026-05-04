const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/My_Courses', authenticateToken, async (req, res) => {
  try {
    const user_id = req.query.student_id || req.query.user_id;
    if (!user_id) {
      return res.status(400).json({ message: 'Missing user_id query parameter.' });
    }

    const result = await pool.query(
      `SELECT
          c.course_id,
          c.course_code,
          c.course_title,
          c.course_desc,
          c.room_number,
          c.capacity,
          c.credits,
          c.tuition_cost,
          c.created_at,
          c.updated_at
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.course_id
       WHERE sc.user_id = $1
       ORDER BY c.course_id`, [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err.message, err.stack);
    res.status(500).json({ message: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
