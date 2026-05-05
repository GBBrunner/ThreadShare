const bcrypt = require('bcrypt');
const crypto = require("crypto");
const express = require('express');
const jwt = require("jsonwebtoken");
const pool = require('../config/database_config');

const router = express.Router();

const ValidatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

router.post('/signup', async (req, res) => {
  try {
    const { first_name, last_name, username, email, user_password } = req.body;
    if (!email || !user_password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!ValidatePassword(user_password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' });
    }
    const sanitizedUsername = username ? username.trim().toLowerCase() : null;
    const user_id = crypto.randomUUID();
    const password_hash = await bcrypt.hash(user_password, 12);

    // user_id generated in Node; PostgreSQL DEFAULT gen_random_uuid() acts as a fallback
    const query = `
      INSERT INTO users (user_id, first_name, last_name, username, email, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, first_name || null, last_name || null, sanitizedUsername, email, password_hash]);
    const signed_in_user = result.rows[0];
    const token = jwt.sign(
      { user_id: signed_in_user.user_id, username: signed_in_user.username },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '3d' }
    );

    return res.status(201).json({ token, user: signed_in_user });
  } catch (error) {
    console.error('Error during signup:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
});
// Export signup router for use in server.js
module.exports = router;