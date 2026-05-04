const express = require('express');
const pool = require('../config/database_config');

const router = express.Router();

// GET /api/courses – list all courses
router.get('/courses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT course_id, course_code, course_title, course_desc, room_number, capacity, credits, tuition_cost, created_at, updated_at FROM courses ORDER BY course_code ASC'
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
