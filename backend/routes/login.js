const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/database_config');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sanitizedUsername = username.trim().toLowerCase();

    if (!sanitizedUsername || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        // Look up user by username
        const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
        const result = await pool.query(query, [sanitizedUsername]);

        if (result.rows.length === 0) {
            // Do not reveal whether username exists; return same 401 for invalid credentials
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const user = result.rows[0];

        // Verify the submitted password against the stored hash
        const validatePassword = await bcrypt.compare(password, user.password_hash);
        if (!validatePassword) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Exclude password_hash from response
        const { password_hash, ...userInfo } = user;

        // Issue a signed JWT so the client can authenticate subsequent requests
        const token = jwt.sign(
            { user_id: userInfo.user_id, username: userInfo.username, user_role: userInfo.user_role },
            process.env.JWT_SECRET || 'default_jwt_secret',
            { expiresIn: '3d' }
        );

        return res.status(200).json({ message: 'Login successful.', token, user: userInfo });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;