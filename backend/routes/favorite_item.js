const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// GET /api/favorite-items — return all post IDs liked by the authenticated user
router.get('/favorite-items', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT post_id FROM post_likes WHERE user_id = $1',
            [req.user.id]
        );
        return res.status(200).json({ likedPostIds: result.rows.map(r => r.post_id) });
    } catch (err) {
        console.error('Error fetching liked posts:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// POST /api/favorite-item — like a post
// Body: { post_id }
router.post('/favorite-item', authenticateToken, async (req, res) => {
    const { post_id } = req.body;
    if (!post_id) return res.status(400).json({ message: 'post_id is required.' });

    try {
        await pool.query(
            'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user.id, post_id]
        );
        const { rows } = await pool.query('SELECT "likesCount" FROM posts WHERE id = $1', [post_id]);
        return res.status(200).json({ likesCount: rows[0]?.likesCount ?? 0 });
    } catch (err) {
        console.error('Error liking post:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE /api/favorite-item/:postId — unlike a post
router.delete('/favorite-item/:postId', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
            [req.user.id, req.params.postId]
        );
        const { rows } = await pool.query('SELECT "likesCount" FROM posts WHERE id = $1', [req.params.postId]);
        return res.status(200).json({ likesCount: rows[0]?.likesCount ?? 0 });
    } catch (err) {
        console.error('Error unliking post:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
