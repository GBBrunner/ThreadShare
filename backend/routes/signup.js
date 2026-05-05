const bcrypt = require('bcrypt');
const crypto = require("crypto");
const express = require('express');
const jwt = require("jsonwebtoken");
const pool = require('../config/database_config');

// Express router is used to define routes
const router = express.Router();
const ValidatePassword = (password) => {
  // Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
  // Although the client should also enforce this, we validate on the server to ensure security even if the client is bypassed
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}
router.post('/signup', async (req, res) => {
  try {
    // This matches the table columns in PostgreSQL
    const { first_name, last_name, username, email, user_password } = req.body;
    if (!first_name || !last_name || !username || !email || !user_password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // sanitize username
    if (!ValidatePassword(user_password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' });
    }
    const sanitizedUsername = username.trim().toLowerCase();
    const user_id = crypto.randomUUID();
    const password_hash = await bcrypt.hash(user_password, 12);
    // const password_hash = user_password;

    // Get the current value of user_count sequence and then increment it
    const sequenceResult = await pool.query("SELECT nextval('user_count') as student_id");
    const student_id = sequenceResult.rows[0].student_id;

    // Role can be set on a per-environment basis, defaulting to 'student'
    const role = process.env.DEFAULT_USER_ROLE || 'student';
    const created_at = new Date();
    const updated_at = new Date();
    // The query template for inserting a new user
    // $1 to $10 are used to prevent SQL injection attacks
    // It will only insert the values provided in the array below
    const query = `
      INSERT INTO users (user_id, first_name, last_name, username, email, password_hash, user_role, created_at, updated_at, student_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, first_name, last_name, sanitizedUsername, email, password_hash, role, created_at, updated_at, student_id]);
    // Generate JWT token for the newly created user to keep them signed in
    const signed_in_user = result.rows[0];
    // JWT or JSON Web Tokens are used to securely send data between endpoints
    const token = jwt.sign(
      {user_id: signed_in_user.user_id, username: signed_in_user.username, user_role: signed_in_user.user_role},
      process.env.JWT_SECRET || 'default_jwt_secret',
      // The signed in token will be valid for a day, then the user will need to sign in again
      {expiresIn: '3d'}
    );

    // 
    const accept = req.get('Accept') || '';
    const redirectTo = req.get('Referer') || '/';
    // Check if the client is expecting a JSON response
    if (accept.includes('application/json')) {
      // Return the new user alongside the signed token so the client can authenticate immediately
      return res.status(201).json({ token, user: signed_in_user });
    } else {
      // Fall back to a cookie and redirect if HTML is expected
      res.cookie('token', token, { httpOnly: true, maxAge: 86400000, secure: process.env.NODE_ENV === 'production' });
      return res.redirect(303, redirectTo);
    }
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