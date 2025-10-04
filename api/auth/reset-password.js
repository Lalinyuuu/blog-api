import bcrypt from 'bcrypt';
import prisma from '../prisma.js';
import { validateResetPassword } from '../utils/validation.js';

export async function resetPassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    const validationErrors = validateResetPassword(currentPassword, newPassword, confirmPassword);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: validationErrors[0].message,
        errors: validationErrors 
      });
    }

    // Get user
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
}