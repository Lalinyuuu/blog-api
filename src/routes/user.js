// routes/user.js
import express from 'express';
import { 
  getUserProfile, 
  getUserPosts, 
  getUserStatistics 
} from '../controllers/users/userController.js';

const router = express.Router();

// Get User Profile
router.get('/:userId', getUserProfile);

// Get User Posts
router.get('/:userId/posts', getUserPosts);

// Get User Statistics
router.get('/:userId/statistics', getUserStatistics);

export default router;
