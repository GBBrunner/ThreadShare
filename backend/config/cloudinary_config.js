const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract the Cloudinary public_id from a stored URL so assets can be deleted.
// URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ts>/threadshare/<name>.jpg
// public_id:  threadshare/<name>  (no version prefix, no extension)
function getPublicId(url) {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const withoutVersion = parts[1].replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
}

module.exports = { cloudinary, getPublicId };
