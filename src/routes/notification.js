import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../controllers/users/notificationController.js';

const router = express.Router();

// GET /api/notifications - ดึง notifications ของผู้ใช้
router.get('/', authenticate, getUserNotifications);

// PUT /api/notifications/:id/read - อ่าน notification
router.put('/:id/read', authenticate, markNotificationAsRead);

// PUT /api/notifications/read-all - อ่านทั้งหมด
router.put('/read-all', authenticate, markAllNotificationsAsRead);

// DELETE /api/notifications/:id - ลบ notification
router.delete('/:id', authenticate, deleteNotification);

export default router;