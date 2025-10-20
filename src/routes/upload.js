import express from 'express';
import { uploadAvatar, uploadPostImage } from '../controllers/posts/uploadController.js';
import { deleteImage } from '../controllers/posts/imageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const logUploadRequests = (req, res, next) => {
  next();
};

const validateUploadType = (expectedType) => (req, res, next) => {
  const { uploadType } = req.body;
  
  if (!uploadType) {
    return res.status(400).json({ error: 'uploadType is required' });
  }
  
  if (uploadType !== expectedType) {
    return res.status(400).json({ 
      error: `Invalid uploadType! Use "${expectedType}" for this endpoint` 
    });
  }
  
  next();
};

const emergencyEndpointProtection = (req, res, next) => {
  const url = req.originalUrl;
  const { uploadType } = req.body;
  
  if (url.includes('/avatar') && uploadType && uploadType !== 'avatar') {
    return res.status(400).json({
      error: 'Wrong uploadType! Use uploadType: "avatar" for avatar endpoint'
    });
  }
  
  if (url.includes('/post') && uploadType && uploadType !== 'post' && uploadType !== 'post-image') {
    return res.status(400).json({
      error: 'Wrong uploadType! Use uploadType: "post" or "post-image" for post endpoint'
    });
  }
  
  next();
};

router.post('/avatar', authenticate, logUploadRequests, emergencyEndpointProtection, validateUploadType('avatar'), uploadAvatar);
router.post('/post', authenticate, logUploadRequests, emergencyEndpointProtection, uploadPostImage);
router.delete('/:publicId', authenticate, deleteImage);

export default router;