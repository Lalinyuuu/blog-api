// Import all comment functions from separate files
import { addComment } from './addComment.js';
import { getComments } from './getComments.js';
import { updateComment } from './updateComment.js';
import { deleteComment } from './deleteComment.js';

// Re-export all functions for backward compatibility
export {
  addComment,
  getComments,
  updateComment,
  deleteComment
};