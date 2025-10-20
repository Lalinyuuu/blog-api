import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  listPosts, 
  getPostBySlug, 
  getPostById,
  getPostComments,
  getPostInteractionStats
} from '../controllers/posts/postController.js';
import {
  likePost,
  unlikePost,
  createComment,
  updateComment,
  deleteComment,
  sharePost
} from '../controllers/posts/postInteractionController.js';

const router = express.Router();

router.get('/', listPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);

// สถิติการโต้ตอบ
router.get('/:id/stats', getPostInteractionStats);

// Like/Unlike
router.post('/:id/like', authenticate, likePost);

// Comments
router.get('/:id/comments', getPostComments);
router.post('/:id/comments', authenticate, createComment);
router.put('/:postId/comments/:commentId', authenticate, updateComment);
router.delete('/:postId/comments/:commentId', authenticate, deleteComment);

// Share
router.post('/:id/share', authenticate, sharePost);

router.post('/admin/posts', authenticate, (req, res) => adminCreatePost(req, res));

export default router;
