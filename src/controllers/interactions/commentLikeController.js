// Import all comment like functions from separate files
import { likeComment, unlikeComment } from './likeComment.js';
import { getCommentLikeStatus } from './getCommentLikeStatus.js';

// Re-export all functions for backward compatibility
export {
  likeComment,
  unlikeComment,
  getCommentLikeStatus
};

