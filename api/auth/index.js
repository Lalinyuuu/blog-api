import express from 'express';
import prisma from '../prisma.js';
import { login } from './login.js';
import { register } from './register.js';
import { logout } from './logout.js';
import { updateProfile } from './update-profile.js';
import { resetPassword } from './reset-password.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.post('/logout', verifyToken, logout);
router.put('/profile', verifyToken, updateProfile);
router.put('/reset-password', verifyToken, resetPassword);

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;