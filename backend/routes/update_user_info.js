const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Maps request body field names to their exact PostgreSQL column names
const FIELD_TO_COLUMN = {
    firstname:        'firstname',
    lastname:         'lastname',
    displayName:      '"displayName"',
    bio:              'bio',
    city:             'city',
    username:         'username',
    email:            'email',
    visibility:       'visibility',
    styleInterests:   '"styleInterests"',
    favoriteBrands:   '"favoriteBrands"',
};

const VALID_VISIBILITY = ['publicProfile', 'privateProfile', 'friendsOnly'];

router.patch('/update_user_info', authenticateToken, async (req, res) => {
    try {
        const setClauses = [];
        const values = [];
        let paramCount = 1;

        for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
            if (!(field in req.body)) continue;

            let value = req.body[field];

            if (field === 'username' && value) {
                value = value.trim().toLowerCase();
            }
            if (field === 'visibility' && value && !VALID_VISIBILITY.includes(value)) {
                return res.status(400).json({
                    message: `Invalid visibility. Must be one of: ${VALID_VISIBILITY.join(', ')}`
                });
            }

            setClauses.push(`${column} = $${paramCount}`);
            values.push(value || null);
            paramCount++;
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided to update.' });
        }

        values.push(req.user.id);
        const query = `
            UPDATE users
            SET ${setClauses.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const { password_hash, ...userInfo } = result.rows[0];
        return res.status(200).json({ message: 'Profile updated successfully.', user: userInfo });
    } catch (err) {
        console.error('Error updating user info:', err);
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Username or email already in use.' });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
