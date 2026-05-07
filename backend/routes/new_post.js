const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary_config');
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

router.post('/new_post', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, brand, size, category, condition, color } = req.body;

        if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required.' });

        let occasions = [];
        if (req.body.occasions) {
            occasions = Array.isArray(req.body.occasions) ? req.body.occasions : JSON.parse(req.body.occasions);
        }

        if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category.' });
        if (condition && !VALID_CONDITIONS.includes(condition)) return res.status(400).json({ message: 'Invalid condition.' });
        const invalidOccasion = occasions.find(o => !VALID_OCCASIONS.includes(o));
        if (invalidOccasion) return res.status(400).json({ message: `Invalid occasion: ${invalidOccasion}` });

        const imageUrls = (req.files || []).map(f => f.path);

        const result = await pool.query(
            `INSERT INTO posts (user_id, title, description, brand, size, category, condition, color, occasions, images)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [req.user.id, title.trim(), description?.trim() || null, brand?.trim() || null,
             size?.trim() || null, category || null, condition || null, color?.trim() || null, occasions, imageUrls]
        );

        return res.status(201).json({ message: 'Post created successfully.', post: result.rows[0] });
    } catch (err) {
        console.error('Error creating post:', err);
        if (err.message === 'Only image files are allowed.') return res.status(400).json({ message: err.message });
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
