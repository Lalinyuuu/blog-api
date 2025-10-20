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
  checkUserInteraction
} from '../controllers/interactions/interactionController.js';
import { authenticate } from '../middleware/auth.js';

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

export default router;
