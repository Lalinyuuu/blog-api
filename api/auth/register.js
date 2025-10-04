import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { validateRegister } from '../utils/validation.js';

export async function register(req, res) {
  try {
    const { email, password, name, username } = req.body;

    // Validate input
    const validationErrors = validateRegister(email, password, name, username);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: validationErrors[0].message,
        errors: validationErrors 
      });
    }

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const usernameExists = await prisma.user.findUnique({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200'
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
}