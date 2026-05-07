const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, getPublicId } = require('../config/cloudinary_config');
const pool = require('../config/database_config');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'threadshare', allowed_formats: ['jpwg', 'jpg', 'jpeg', 'png', 'gif', 'webp'] },
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

// GET /api/posts — paginated posts from all users (public feed)
// Query params: limit (default 10), offset (default 0), category, condition, occasions
router.get('/posts', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);
        
        // Build WHERE clause for filters (ready for future filtering)
        let whereConditions = [];
        let params = [];
        
        if (req.query.category) {
            whereConditions.push(`category = $${params.length + 1}`);
            params.push(req.query.category);
        }
        
        if (req.query.condition) {
            whereConditions.push(`condition = $${params.length + 1}`);
            params.push(req.query.condition);
        }
        
        // Build occasions filter if provided
        if (req.query.occasions) {
            try {
                const occasions = Array.isArray(req.query.occasions) 
                    ? req.query.occasions 
                    : JSON.parse(req.query.occasions);
                if (occasions.length > 0) {
                    // Note: This is a simplified check; in production you'd want proper array containment
                    whereConditions.push(`occasions @> $${params.length + 1}::text[]`);
                    params.push(JSON.stringify(occasions));
                }
            } catch (e) {
                console.warn('Invalid occasions filter:', e);
            }
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const limitParam = params.length + 1;
        const offsetParam = params.length + 2;
        
        const result = await pool.query(
            `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`,
            [...params, limit, offset]
        );
        
        // Get total count with filters applied
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM posts ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);
        
        return res.status(200).json({
            posts: result.rows,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/my_posts — paginated posts belonging to the authenticated user
// Query params: limit (default 10), offset (default 0)
router.get('/my_posts', authenticateToken, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per request
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);

        const result = await pool.query(
            'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [req.user.id, limit, offset]
        );

        // Get total count for pagination info
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM posts WHERE user_id = $1',
            [req.user.id]
        );
        const total = parseInt(countResult.rows[0].count);

        return res.status(200).json({
            posts: result.rows,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
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

        // Ensure occasions is always an array
        let occasions = [];
        
        // Try to parse post.occasions if it exists
        if (post.occasions) {
            try {
                if (typeof post.occasions === 'string') {
                    occasions = JSON.parse(post.occasions);
                } else if (Array.isArray(post.occasions)) {
                    occasions = post.occasions;
                }
            } catch (parseErr) {
                console.warn('Failed to parse post.occasions:', post.occasions, parseErr);
                occasions = [];
            }
        }

        // Override with new occasions if provided
        if (req.body.occasions) {
            try {
                occasions = Array.isArray(req.body.occasions) ? req.body.occasions : JSON.parse(req.body.occasions);
            } catch (parseErr) {
                console.warn('Failed to parse req.body.occasions:', req.body.occasions, parseErr);
                occasions = [];
            }
        }

        if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category.' });
        if (condition && !VALID_CONDITIONS.includes(condition)) return res.status(400).json({ message: 'Invalid condition.' });
        
        // Ensure occasions is an array before validation
        if (!Array.isArray(occasions)) {
            occasions = [];
        }
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
        console.error('Error updating post:', err.message, err);
        return res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});

module.exports = router;
