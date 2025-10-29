import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  updateProfile,
  getMe,
  resetPassword,
  logout,
} from '../controllers/auth/authController.js';
import { checkEmail, checkUsername, checkPassword, authorizeAdmin } from './authValidation.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/reset-password', authenticate, resetPassword);

// Validation routes
router.post('/check-email', checkEmail);
router.post('/check-username', checkUsername);
router.post('/check-password', checkPassword);

// Export admin authorization for use in other routes
export { authorizeAdmin };

export default router;