/**
 * Transform Cloudinary URL to specific aspect ratio
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const transformCloudinaryUrl = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = 1200,
    height = 900,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto:good'
  } = options;

  // Split URL at /upload/
  const parts = imageUrl.split('/upload/');
  if (parts.length !== 2) return imageUrl;

  // Insert transformation parameters
  const transformation = `w_${width},h_${height},c_${crop},g_${gravity},q_${quality}`;
  const transformedUrl = `${parts[0]}/upload/${transformation}/${parts[1]}`;

  return transformedUrl;
};

/**
 * Transform post image to 16:9 aspect ratio
 */
export const transformPostImage = (imageUrl) => {
  return transformCloudinaryUrl(imageUrl, {
    width: 1920,
    height: 1080,
    crop: 'fill',
    gravity: 'center',
    quality: 'auto:good'
  });
};

/**
 * Transform avatar to square 1:1
 */
export const transformAvatar = (imageUrl, size = 400) => {
  return transformCloudinaryUrl(imageUrl, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'center',
    quality: 'auto:good'
  });
};

export default {
  transformCloudinaryUrl,
  transformPostImage,
  transformAvatar
};

