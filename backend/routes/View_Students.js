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

router.put('/Edit_Student/:id', authenticateToken, requireAdmin, async (req, res) => {
    const studentId = req.params.id;
    const { first_name, last_name, username, email, student_id } = req.body;

    try {
        await pool.query(
            `UPDATE users
             SET first_name = $1, last_name = $2, username = $3, email = $4, student_id = $5
             WHERE user_id = $6`,
            [first_name, last_name, username, email, student_id || null, studentId]
        );
        // Return the full updated student row so the client can refresh its state
        const updated = await pool.query(
            `SELECT first_name, last_name, username, email, student_id, user_id
             FROM users WHERE user_id = $1`,
            [studentId]
        );
        res.json(updated.rows[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;