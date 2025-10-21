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

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/reset-password', authenticate, resetPassword);

router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.json({ message: 'Email available' });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    res.json({ message: 'Username available' });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/check-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password too short' });
  }
  
  res.json({ message: 'Password is strong' });
});

export function authorizeAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden (admin only)' });
    }
    next();
  }

export default router;