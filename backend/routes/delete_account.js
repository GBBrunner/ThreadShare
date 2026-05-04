const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// DELETE /api/delete_account
// Requires auth; a user may only delete their own account (admins may delete any account)
router.delete('/delete_account', authenticateToken, async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  // Only allow deleting your own account unless you are an admin
  if (req.user.username !== username && req.user.user_role !== 'admin') {
    return res.status(403).json({ error: 'You can only delete your own account.' });
  }
  try {
    const result = await pool.query('DELETE FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
