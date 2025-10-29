import express from 'express';
import { uploadAvatar, uploadPostImage } from '../controllers/posts/uploadController.js';
import { deleteImage } from '../controllers/posts/imageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Health check endpoint for connection testing
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Upload service is running',
    timestamp: new Date().toISOString()
  });
});

// Simplified routes - validation is now handled in controllers
router.post('/avatar', authenticate, uploadAvatar);
router.post('/post', authenticate, uploadPostImage);
router.delete('/:publicId', authenticate, deleteImage);

export default router;