// Import all image functions from separate files
import { deleteImage, getUserImages } from './deleteImage.js';
import { getImageInfo } from './getImageInfo.js';

// Re-export all functions for backward compatibility
export {
  deleteImage,
  getUserImages,
  getImageInfo
};
