const express = require('express');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// GET /api/comments/:postId — public, returns all comments with commenter info
router.get('/comments/:postId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pc.id, pc.user_id, pc.content, pc.created_at, pc.updated_at,
                    u.username, u."displayName", u."avatarImageName"
             FROM post_comments pc
             JOIN users u ON u.id = pc.user_id
             WHERE pc.post_id = $1
             ORDER BY pc.created_at ASC`,
            [req.params.postId]
        );
        return res.status(200).json({ comments: result.rows });
    } catch (err) {
        console.error('Error fetching comments:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/commented-posts — paginated posts the authenticated user has commented on
router.get('/commented-posts', authenticateToken, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);

        const result = await pool.query(
            `SELECT p.* FROM posts p
             JOIN post_comments pc ON pc.post_id = p.id
             WHERE pc.user_id = $1
             ORDER BY pc.created_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM post_comments WHERE user_id = $1',
            [req.user.id]
        );
        const total = parseInt(countResult.rows[0].count);
        return res.status(200).json({
            posts: result.rows,
            pagination: { total, limit, offset, hasMore: offset + limit < total },
        });
    } catch (err) {
        console.error('Error fetching commented posts:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// POST /api/comment — create a comment (one per user per post)
// Body: { post_id, content }
router.post('/comment', authenticateToken, async (req, res) => {
    const { post_id, content } = req.body;
    if (!post_id) return res.status(400).json({ message: 'post_id is required.' });
    if (!content?.trim()) return res.status(400).json({ message: 'content is required.' });

    try {
        const result = await pool.query(
            `INSERT INTO post_comments (user_id, post_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.id, post_id, content.trim()]
        );
        const { rows } = await pool.query('SELECT "commentsCount" FROM posts WHERE id = $1', [post_id]);
        return res.status(201).json({ comment: result.rows[0], commentsCount: rows[0]?.commentsCount ?? 0 });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'You have already commented on this post.' });
        console.error('Error creating comment:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// PATCH /api/comment/:postId — edit own comment
// Body: { content }
router.patch('/comment/:postId', authenticateToken, async (req, res) => {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'content is required.' });

    try {
        const result = await pool.query(
            `UPDATE post_comments
             SET content = $1, updated_at = now()
             WHERE user_id = $2 AND post_id = $3
             RETURNING *`,
            [content.trim(), req.user.id, req.params.postId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Comment not found.' });
        return res.status(200).json({ comment: result.rows[0] });
    } catch (err) {
        console.error('Error updating comment:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE /api/comment/:postId — delete own comment
router.delete('/comment/:postId', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM post_comments WHERE user_id = $1 AND post_id = $2 RETURNING id',
            [req.user.id, req.params.postId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Comment not found.' });
        const { rows } = await pool.query('SELECT "commentsCount" FROM posts WHERE id = $1', [req.params.postId]);
        return res.status(200).json({ commentsCount: rows[0]?.commentsCount ?? 0 });
    } catch (err) {
        console.error('Error deleting comment:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
