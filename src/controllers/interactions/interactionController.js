// Import all interaction functions from separate files
import { likePost, unlikePost } from './likePost.js';
import { savePost, unsavePost } from './savePost.js';
import { checkUserInteraction, getSavedPosts, incrementViewCount, sharePost } from './userInteraction.js';

// Re-export all functions for backward compatibility
export {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  checkUserInteraction,
  getSavedPosts,
  incrementViewCount,
  sharePost
};
