const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/View_Students', authenticateToken, requireAdmin, async (req, res) => {
    try{
        // JWT verified and admin role confirmed; fetch all students
        const result = await pool.query(
            `SELECT first_name, last_name, username, email, student_id, user_id
             FROM users
             WHERE user_role = 'student'`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;