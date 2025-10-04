export function validateResetPassword(currentPassword, newPassword, confirmPassword) {
    const errors = [];
  
    if (!currentPassword) {
      errors.push({ field: 'currentPassword', message: 'Current password is required' });
    }
  
    if (!newPassword) {
      errors.push({ field: 'newPassword', message: 'New password is required' });
    } else if (newPassword.length < 6) {
      errors.push({ field: 'newPassword', message: 'Password must be at least 6 characters' });
    }
  
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
  
    if (!name || !name.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
  
    if (!username || !username.trim()) {
      errors.push({ field: 'username', message: 'Username is required' });
    } else if (username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers and underscore' });
    }
  
    return errors;
  }
  
  export function validateRegister(email, password, name, username) {
    const errors = [];
  
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
  
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
  
    if (!name || !name.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
  
    if (!username || !username.trim()) {
      errors.push({ field: 'username', message: 'Username is required' });
    } else if (username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers and underscore' });
    }
  
    return errors;
  }