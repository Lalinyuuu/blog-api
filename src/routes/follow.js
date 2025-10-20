import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowers,
  getFollowing
} from '../controllers/users/followController.js';
import {
  getFollowStats,
  getFeed
} from '../controllers/users/followStatsController.js';

const router = express.Router();

// Debug route (ไม่ต้อง auth)
router.get('/debug', (req, res) => {
  res.json({
    message: 'Follow routes working',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Test follow route (ไม่ต้อง auth)
router.post('/test/:userId', (req, res) => {
  res.json({
    message: 'Test follow endpoint working',
    userId: req.params.userId,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// All routes require authentication
router.use(authenticate);

/**
 * Follow/Unfollow Routes
 */
// Follow a user
router.post('/:userId', followUser);

// Unfollow a user
router.delete('/:userId', unfollowUser);

// Check follow status
router.get('/:userId/status', checkFollowStatus);

/**
 * User Follow Lists Routes
 */
// Get followers of a user
router.get('/users/:userId/followers', getFollowers);

// Get users that a user is following
router.get('/users/:userId/following', getFollowing);

// Get follow stats for a user
router.get('/users/:userId/follow-stats', getFollowStats);

/**
 * Feed Route
 */
// Get feed (posts from users you follow)
router.get('/feed', getFeed);

export default router;
