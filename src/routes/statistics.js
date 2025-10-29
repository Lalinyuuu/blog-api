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
  getTimeBasedStatistics,
  getUserStatisticsGeneral,
  getPostStatisticsGeneral,
  getEngagementStatistics
} from '../controllers/analytics/analyticsController.js';

const router = express.Router();

// General Statistics (for admin dashboard)
router.get('/platforms', getPlatformStatistics);
router.get('/users', getUserStatisticsGeneral);
router.get('/posts', getPostStatisticsGeneral);
router.get('/engagement', getEngagementStatistics);

// Specific Statistics (for individual items)
router.get('/posts/:postId', getPostStatistics);
router.post('/posts/multiple', getMultiplePostsStatistics);
router.get('/users/:userId', getUserStatistics);

// Category Statistics
router.get('/categories', getCategoryStatistics);

// Time-based Statistics
router.get('/time-based', getTimeBasedStatistics);

export default router;
