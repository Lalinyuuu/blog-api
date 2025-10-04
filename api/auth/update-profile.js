import prisma from '../prisma.js';
import { validateProfile } from '../utils/validation.js';

export async function updateProfile(req, res) {
  try {
    const { name, username } = req.body;
    const userId = req.user.userId;

    // Validate input
    const validationErrors = validateProfile(name, username);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: validationErrors[0].message,
        errors: validationErrors 
      });
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