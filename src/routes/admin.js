import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getStats,
  getAllPosts,
  createPost,
  getPostByIdAdmin,
  updatePost,
  deletePost,
} from '../controllers/admin/adminController.js';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/admin/adminUserController.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

// Stats
router.get('/stats', getStats);

// Posts
router.get('/posts', getAllPosts);
router.post('/posts', createPost);
router.get('/posts/:id', getPostByIdAdmin);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;