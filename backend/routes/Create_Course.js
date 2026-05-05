const crypto = require("crypto");
const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();
router.post('/Add_Course', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let {
      course_code,
      course_title,
      course_desc = "No description provided.",
      room_number = "TBA",
      capacity = 15,
      credits = 1,
      tuition_cost = 0
    } = req.body;

    if (!course_code || !course_title) {
      return res.status(400).json({ message: 'Course code and title are required.' });
    }

    // Enforce uppercase and default for room_number
    course_code = (course_code || '').toUpperCase();
    room_number = (room_number && room_number.trim() !== '' ? room_number : 'TBA').toUpperCase();

    // Parse numbers
    capacity = parseInt(capacity) || 15;
    credits = parseInt(credits) || 1;
    tuition_cost = parseFloat(tuition_cost) || 0;

    const course_id = crypto.randomUUID();
    const created_at = new Date();
    const updated_at = new Date();

    const query =`
      INSERT INTO courses (course_id, course_code, course_title, course_desc, room_number, capacity, credits, tuition_cost, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const accept = req.get('Accept') || '';
    const redirectTo = req.get('Referer') || '/';
    const result = await pool.query(query, [course_id, course_code, course_title, course_desc, room_number, capacity, credits, tuition_cost, created_at, updated_at]);
    if (accept.includes('application/json')) {
      return res.status(201).json({ message: 'Course added successfully.', course: result.rows[0] });
    } else {
      return res.redirect(303, redirectTo);
    }
} catch (err) {
    console.error('Error adding course:', err);
    if (err.code === '23505') { // Unique violation (e.g., duplicate course code
        return res.status(409).json({ message: 'Course code or title already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
});
module.exports = router;
