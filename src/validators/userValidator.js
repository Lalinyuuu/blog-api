import userService from '../services/userService.js';

export const validateUserData = (userData) => {
  const errors = [];

  if (!userData.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(userData.email)) {
    errors.push('Invalid email format');
  }

  if (!userData.username) {
    errors.push('Username is required');
  } else if (userData.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!userData.password) {
    errors.push('Password is required');
  } else if (userData.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePostData = (postData) => {
  const errors = [];

  if (!postData.title) {
    errors.push('Title is required');
  } else if (postData.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!postData.content) {
    errors.push('Content is required');
  } else if (postData.content.length < 10) {
    errors.push('Content must be at least 10 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = async (email) => {
  if (!email) {
    return { isValid: false, error: 'Email required' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const exists = await userService.checkEmailExists(email);
  if (exists) {
    return { isValid: false, error: 'Email already exists' };
  }

  return { isValid: true, message: 'Email available' };
};

export const validateUsername = async (username) => {
  if (!username) {
    return { isValid: false, error: 'Username required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username too short' };
  }

  const exists = await userService.checkUsernameExists(username);
  if (exists) {
    return { isValid: false, error: 'Username already exists' };
  }

  return { isValid: true, message: 'Username available' };
};

export const validatePassword = (password) => {
  return userService.validatePassword(password);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
