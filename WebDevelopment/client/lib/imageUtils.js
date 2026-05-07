/**
 * Transform Cloudinary URL for responsive image delivery
 * @param {string} cloudinaryUrl - Original Cloudinary URL
 * @param {number} width - Max width in pixels (default: 800)
 * @returns {string} Transformed URL with optimization parameters
 * 
 * Parameters:
 * - w_${width}: Max width
 * - h_auto: Maintain aspect ratio
 * - c_limit: Don't upscale small images
 * - q_auto: Auto quality optimization
 * - f_auto: Auto format selection (webp for modern browsers)
 */
export const getResponsiveImageUrl = (cloudinaryUrl, width = 800) => {
  if (!cloudinaryUrl) return cloudinaryUrl;
  return cloudinaryUrl.replace(
    /\/upload\//,
    `/upload/w_${width},h_auto,c_limit,q_auto,f_auto/`
  );
};

/**
 * Constrain aspect ratios to reasonable bounds
 * @param {number} ratio - Natural aspect ratio (width/height)
 * @returns {number} Constrained ratio between 0.33 (1:3) and 3 (3:1)
 */
export const constrainAspectRatio = (ratio) => {
  const MIN_RATIO = 0.33;
  const MAX_RATIO = 3;
  return Math.max(MIN_RATIO, Math.min(MAX_RATIO, ratio));
};

/**
 * Get dimensions for responsive image srcset
 * Returns different widths optimized for various screen sizes
 * @param {string} cloudinaryUrl - Original Cloudinary URL
 * @returns {string} srcset string for responsive images
 */
export const getImageSrcSet = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return "";
  const widths = [400, 600, 800, 1200];
  return widths
    .map((width) => `${getResponsiveImageUrl(cloudinaryUrl, width)} ${width}w`)
    .join(", ");
};
