import prisma from '../prisma.js';
import { verifyToken } from '../middleware/auth.js';

export async function updateProfile(req, res) {
  try {
    const { name, username } = req.body;
    const userId = req.user.userId;

    if (!name || !username) {
      return res.status(400).json({ error: 'Name and username are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers and underscore' });
    }

    // Check if username is taken by another user
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, username },
      select: { id: true, email: true, username: true, name: true, avatar: true, role: true }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
}