const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, getPublicId } = require('../config/cloudinary_config');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'threadshare', allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
});

const upload = multer({
    storage,
    limits: { files: 5, fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed.'));
        cb(null, true);
    },
});

const VALID_CATEGORIES = ['tops', 'bottoms', 'dresses', 'shoes', 'sweaters', 'accessories', 'other'];
const VALID_CONDITIONS  = ['newWithTags', 'likeNew', 'good', 'worn'];
const VALID_OCCASIONS   = ['formal', 'business', 'casual', 'everyday', 'vacation', 'work', 'gym', 'sports', 'party', 'swimwear', 'outerwear', 'other'];

// GET /api/my_posts — all posts belonging to the authenticated user
router.get('/my_posts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        return res.status(200).json({ posts: result.rows });
    } catch (err) {
        console.error('Error fetching posts:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE /api/posts/:id — delete post + its Cloudinary images
router.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Post not found.' });

        for (const url of rows[0].images) {
            const publicId = getPublicId(url);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
        return res.status(200).json({ message: 'Post deleted.' });
    } catch (err) {
        console.error('Error deleting post:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// PATCH /api/posts/:id — update post fields; if new images are uploaded they replace the old ones
router.patch('/posts/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Post not found.' });

        const post = rows[0];
        const { title, description, brand, size, category, condition, color } = req.body;

        let occasions = post.occasions;
        if (req.body.occasions) {
            occasions = Array.isArray(req.body.occasions) ? req.body.occasions : JSON.parse(req.body.occasions);
        }

        if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category.' });
        if (condition && !VALID_CONDITIONS.includes(condition)) return res.status(400).json({ message: 'Invalid condition.' });
        const invalidOccasion = occasions.find(o => !VALID_OCCASIONS.includes(o));
        if (invalidOccasion) return res.status(400).json({ message: `Invalid occasion: ${invalidOccasion}` });

        let images = post.images;
        if (req.files && req.files.length > 0) {
            // Delete old Cloudinary assets before storing the new ones
            for (const url of post.images) {
                const publicId = getPublicId(url);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            images = req.files.map(f => f.path);
        }

        const result = await pool.query(
            `UPDATE posts SET
                title=$1, description=$2, brand=$3, size=$4,
                category=$5, condition=$6, color=$7, occasions=$8, images=$9
             WHERE id=$10 RETURNING *`,
            [
                title?.trim() || post.title,
                description !== undefined ? (description.trim() || null) : post.description,
                brand !== undefined ? (brand.trim() || null) : post.brand,
                size !== undefined ? (size.trim() || null) : post.size,
                category || post.category,
                condition || post.condition,
                color !== undefined ? (color.trim() || null) : post.color,
                occasions,
                images,
                req.params.id,
            ]
        );

        return res.status(200).json({ message: 'Post updated.', post: result.rows[0] });
    } catch (err) {
        console.error('Error updating post:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
