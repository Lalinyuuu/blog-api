// routes/statistics.js
import express from 'express';
import { 
  getPostStatistics, 
  getMultiplePostsStatistics, 
  getUserStatistics
} from '../controllers/analytics/statisticsController.js';
import {
  getPlatformStatistics,
  getCategoryStatistics,
  getTimeBasedStatistics
} from '../controllers/analytics/analyticsController.js';

const router = express.Router();

// Get Post Statistics
router.get('/posts/:postId', getPostStatistics);

// Get Multiple Posts Statistics
router.post('/posts/multiple', getMultiplePostsStatistics);

// Get User Statistics
router.get('/users/:userId', getUserStatistics);


// Get Platform Statistics
router.get('/platforms', getPlatformStatistics);

export default router;
