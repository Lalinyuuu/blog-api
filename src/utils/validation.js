/**
 * Shared validation utilities for the application
 * Used by both frontend and backend for consistent validation
 */

/* ---------- Individual Validation Functions ---------- */

export function validatePassword(password) {
  const errors = [];
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
    return errors;
  }
  
  if (password.length < 8 || password.length > 10) {
    errors.push({ field: 'password', message: 'Password must be 8-10 characters' });
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  
  return errors;
}

export function validateEmail(email) {
  const errors = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
    return errors;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  return errors;
}

export function validateUsername(username) {
  const errors = [];
  
  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' });
    return errors;
  }
  
  if (username.length < 3 || username.length > 20) {
    errors.push({ field: 'username', message: 'Username must be 3-20 characters' });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push({ field: 'username', message: 'Username can only contain letters, numbers and underscore' });
  }
  
  return errors;
}

export function validateName(name) {
  const errors = [];
  
  if (!name || !name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      errors.push({ field: 'name', message: 'Name must be 2-50 characters' });
    }
  }
  
  return errors;
}

/* ---------- Combined Validation Functions ---------- */

export function validateResetPassword(currentPassword, newPassword, confirmPassword) {
  const errors = [];
  
  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  
  // ใช้ validatePassword function ใหม่
  const newPasswordErrors = validatePassword(newPassword);
  errors.push(...newPasswordErrors);
  
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your new password' });
  } else if (newPassword !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push({ field: 'newPassword', message: 'New password must be different from current password' });
  }
  
  return errors;
}

export function validateProfile(name, username) {
  const errors = [];
  
  const nameErrors = validateName(name);
  const usernameErrors = validateUsername(username);
  
  errors.push(...nameErrors, ...usernameErrors);
  
  return errors;
}

export function validateRegister(email, password, name, username) {
  const errors = [];
  
  const emailErrors = validateEmail(email);
  const passwordErrors = validatePassword(password);
  const nameErrors = validateName(name);
  const usernameErrors = validateUsername(username);
  
  errors.push(...emailErrors, ...passwordErrors, ...nameErrors, ...usernameErrors);
  
  return errors;
}

/* ---------- Additional Validation Functions from Guide ---------- */

export function validatePasswordConfirmation(password, confirmPassword) {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
    return errors;
  }
  
  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  return errors;
}

export function validateRegistrationForm({ email, password, name, username, confirmPassword }) {
  const errors = {};
  
  const emailErrors = validateEmail(email);
  const passwordErrors = validatePassword(password);
  const nameErrors = validateName(name);
  const usernameErrors = validateUsername(username);
  const confirmPasswordErrors = validatePasswordConfirmation(password, confirmPassword);
  
  if (emailErrors.length > 0) errors.email = emailErrors[0].message;
  if (passwordErrors.length > 0) errors.password = passwordErrors[0].message;
  if (nameErrors.length > 0) errors.name = nameErrors[0].message;
  if (usernameErrors.length > 0) errors.username = usernameErrors[0].message;
  if (confirmPasswordErrors.length > 0) errors.confirmPassword = confirmPasswordErrors[0].message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validatePasswordResetForm({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  
  if (!currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  const newPasswordErrors = validatePassword(newPassword);
  const confirmPasswordErrors = validatePasswordConfirmation(newPassword, confirmPassword);
  
  if (newPasswordErrors.length > 0) errors.newPassword = newPasswordErrors[0].message;
  if (confirmPasswordErrors.length > 0) errors.confirmPassword = confirmPasswordErrors[0].message;
  
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}