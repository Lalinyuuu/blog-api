// routes/comments.js
import express from 'express';
import { 
  addComment, 
  getComments, 
  updateComment, 
  deleteComment
} from '../controllers/interactions/commentController.js';
import {
  getUserComments
} from '../controllers/interactions/commentStatsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add Comment
router.post('/posts/:postId/comments', authenticate, addComment);

// Get Comments
router.get('/posts/:postId/comments', getComments);

// Update Comment
router.put('/comments/:commentId', authenticate, updateComment);

// Delete Comment
router.delete('/comments/:commentId', authenticate, deleteComment);
router.delete('/posts/:postId/comments/:commentId', authenticate, deleteComment);

// Get User Comments
router.get('/users/comments', authenticate, getUserComments);

export default router;
