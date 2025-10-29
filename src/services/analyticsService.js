import analyticsRepository from '../repositories/analyticsRepository.js';

export class AnalyticsService {
  async getPlatformStatistics() {
    return await analyticsRepository.getPlatformStatistics();
  }

  async getCategoryStatistics() {
    return await analyticsRepository.getCategoryStatistics();
  }

  async getUserStatistics() {
    return await analyticsRepository.getUserStatistics();
  }

  async getPostStatistics() {
    return await analyticsRepository.getPostStatistics();
  }

  async getEngagementStatistics() {
    return await analyticsRepository.getEngagementStatistics();
  }

  async getTimeBasedStatistics() {
    return await analyticsRepository.getTimeBasedStatistics();
  }

  async getPostStatisticsById(postId) {
    return await analyticsRepository.getPostStatisticsById(postId);
  }

  async getMultiplePostsStatistics(postIds) {
    if (!Array.isArray(postIds) || postIds.length === 0) {
      throw new Error('Post IDs array is required');
    }
    return await analyticsRepository.getMultiplePostsStatistics(postIds);
  }

  async getUserStatisticsById(userId) {
    return await analyticsRepository.getUserStatisticsById(userId);
  }
}

export default new AnalyticsService();
