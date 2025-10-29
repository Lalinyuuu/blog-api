import { validateEmail, validateUsername, validatePassword } from '../validators/userValidator.js';

// Check if email exists
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await validateEmail(email);
    
    if (!result.isValid) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ message: result.message });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if username exists
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const result = await validateUsername(username);
    
    if (!result.isValid) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ message: result.message });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check password strength
export const checkPassword = (req, res) => {
  const { password } = req.body;
  const result = validatePassword(password);
  
  if (!result.isValid) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ message: 'Password is strong' });
};

// Admin authorization middleware
export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden (admin only)' });
  }
  next();
};
