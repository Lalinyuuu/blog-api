// routes/interactions.js
import express from 'express';
import { 
  likePost, 
  unlikePost
} from '../controllers/interactions/likeController.js';
import {
  savePost, 
  unsavePost, 
  getSavedPosts
} from '../controllers/interactions/saveController.js';
import {
  sharePost
} from '../controllers/interactions/shareController.js';
import {
  checkUserInteraction,
  incrementViewCount
} from '../controllers/interactions/interactionController.js';
import {
  likeComment,
  unlikeComment,
  getCommentLikeStatus
} from '../controllers/interactions/commentLikeController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// Like/Unlike Posts
router.post('/posts/:postId/like', authenticate, likePost);
router.delete('/posts/:postId/like', authenticate, unlikePost);

// Save/Unsave Posts
router.post('/posts/:postId/save', authenticate, savePost);
router.delete('/posts/:postId/save', authenticate, unsavePost);

// Check User Interaction Status
router.get('/posts/:postId/status', authenticate, checkUserInteraction);

// Get Saved Posts
router.get('/saved-posts', authenticate, getSavedPosts);

// Share Post
router.post('/posts/:postId/share', sharePost); // ไม่ต้อง authenticate เพื่อให้ anonymous shares ได้

// Increment View Count
router.post('/posts/:postId/view', incrementViewCount); // ไม่ต้อง authenticate เพื่อให้ทุกคนนับ view ได้

// Like/Unlike Comments
router.post('/comments/:id/like', authenticate, likeComment);
router.delete('/comments/:id/like', authenticate, unlikeComment);

// Get Comment Like Status (optional auth)
router.get('/comments/:id/status', optionalAuthenticate, getCommentLikeStatus);

export default router;
