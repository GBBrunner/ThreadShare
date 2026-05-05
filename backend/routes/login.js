const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/database_config');

const router = express.Router();

/**
 * Core authentication logic
 * Reused by both /login and /login/demo
 */
async function authenticateUser(username, password) {
    const sanitizedUsername = (username || '').trim().toLowerCase();

    if (!sanitizedUsername || !password) {
        throw { status: 400, message: 'Username and password are required.' };
    }

    // Look up user by username
    const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
    const result = await pool.query(query, [sanitizedUsername]);

    if (result.rows.length === 0) {
        // Do not reveal whether username exists; return same 401 for invalid credentials
        throw { status: 401, message: 'Invalid username or password.' };
    }

    const user = result.rows[0];

    // Validate password
    // Verify the submitted password against the stored hash
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        throw { status: 401, message: 'Invalid username or password.' };
    }

    // Remove password_hash before sending back by excluding it from the user info
    const { password_hash, ...userInfo } = user;

    // Issue a signed JWT so the client can authenticate subsequent requests
    const token = jwt.sign(
        {
            user_id: userInfo.user_id,
            username: userInfo.username
        },
        process.env.JWT_SECRET || 'default_jwt_secret',
        { expiresIn: '3d' }
    );

    return { token, user: userInfo };
}

/**
 * Standard Login Route
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authenticateUser(username, password);

        return res.status(200).json({
            message: 'Login successful.',
            ...result
        });

    } catch (err) {
        return res
            .status(err.status || 500)
            .json({ message: err.message || 'Internal server error.' });
    }
});

/**
 * Demo Login Route
 * Credentials stored only in environment variables
 */
router.post('/login/demo-stu', async (req, res) => {
    try {
        const result = await authenticateUser(
            // Don't expose the credentials to the client,
            // Even though they'll have the same permissions, it's best practice to keep them hidden
            process.env.DEMO_STU_USERNAME,
            process.env.DEMO_STU_PASSWORD
        );

        return res.status(200).json({
            message: 'Demo student login successful.',
            ...result
        });

    } catch (err) {
        return res
            .status(err.status || 500)
            .json({ message: err.message || 'Internal server error.' });
    }
});
router.post('/login/demo-admin', async (req, res) => {
    try {
        const result = await authenticateUser(
            // Don't expose the credentials to the client,
            // Even though they'll have the same permissions, it's best practice to keep them hidden
            process.env.DEMO_ADMIN_USERNAME,
            process.env.DEMO_ADMIN_PASSWORD
        );

        return res.status(200).json({
            message: 'Demo admin login successful.',
            ...result
        });

    } catch (err) {
        return res
            .status(err.status || 500)
            .json({ message: err.message || 'Internal server error.' });
    }
});
module.exports = router;