// Import all notification functions from separate files
import { getUserNotifications, markNotificationAsRead } from './getUserNotifications.js';
import { markAllNotificationsAsRead, deleteNotification } from './manageNotifications.js';

// Re-export all functions for backward compatibility
export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};