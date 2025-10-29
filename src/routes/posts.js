import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { 
  listPosts, 
  getPostBySlug, 
  getPostById,
  getPostComments,
  getPostInteractionStats
} from '../controllers/posts/postController.js';
import { getRelatedPosts } from '../controllers/posts/getRelatedPosts.js';
import {
  likePost,
  unlikePost,
  createComment,
  updateComment,
  deleteComment,
  sharePost
} from '../controllers/posts/postInteractionController.js';

const router = express.Router();

// 1. Exact match routes - ไม่มี parameter
router.get('/', listPosts);

// 2. Specific literal routes - มีชื่อ path ที่แน่นอน
router.get('/slug/:slug', optionalAuthenticate, getPostBySlug);

// 3. Specific parametric routes - ต้องมาก่อน generic routes
// Routes with /id/something ต้องขึ้นมาก่อน /id
router.get('/:id/related', optionalAuthenticate, getRelatedPosts);
router.get('/:id/stats', optionalAuthenticate, getPostInteractionStats);
router.get('/:id/comments', optionalAuthenticate, getPostComments);

// 4. POST, PUT, DELETE routes ของ specific paths
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comments', authenticate, createComment);
router.put('/:postId/comments/:commentId', authenticate, updateComment);
router.delete('/:postId/comments/:commentId', authenticate, deleteComment);
router.post('/:id/share', authenticate, sharePost);

// 5. Generic routes - ต้องมาสุดท้าย
// เพราะ :id จะ match กับอะไรก็ได้
router.get('/:id', optionalAuthenticate, getPostById);

export default router;