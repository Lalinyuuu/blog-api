// Import all follow functions from separate files
import { followUser, unfollowUser } from './followUser.js';
import { checkFollowStatus, getFollowers, getFollowing } from './followStatus.js';

// Re-export all functions for backward compatibility
export {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowers,
  getFollowing
};