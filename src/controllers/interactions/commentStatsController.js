// Import all comment stats functions from separate files
import { getUserComments, getCommentStatistics } from './getUserComments.js';
import { getCommentById, getCommentsByUser } from './getCommentById.js';

// Re-export all functions for backward compatibility
export {
  getUserComments,
  getCommentStatistics,
  getCommentById,
  getCommentsByUser
};
