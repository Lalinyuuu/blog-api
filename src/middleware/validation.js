import { body, validationResult } from 'express-validator';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateUsername,
  validateRegister,
  validateResetPassword,
  validateRegistrationForm,
  validatePasswordResetForm
} from '../utils/validation.js';

/* ---------- Express Validator Rules ---------- */

// Registration validation rules
export const registrationRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email format is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8, max: 10 })
    .withMessage('Password must be 8-10 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase letters and numbers'),
  
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
    .trim(),
  
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscore')
    .trim()
];

// Password reset validation rules
export const passwordResetRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 10 })
    .withMessage('Password must be 8-10 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase letters and numbers'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/* ---------- Custom Validation Middleware ---------- */

// Registration validation middleware (Enhanced version)
export const validateRegistration = (req, res, next) => {
  const { email, password, name, username, confirmPassword } = req.body;
  
  const validation = validateRegistrationForm({
    email,
    password,
    name,
    username,
    confirmPassword
  });
  
  if (!validation.isValid) {
    const errors = Object.entries(validation.errors).map(([field, message]) => ({
      field,
      message
    }));
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

// Password reset validation middleware (Enhanced version)
export const validatePasswordReset = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  const validation = validatePasswordResetForm({
    currentPassword,
    newPassword,
    confirmPassword
  });
  
  if (!validation.isValid) {
    const errors = Object.entries(validation.errors).map(([field, message]) => ({
      field,
      message
    }));
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

/* ---------- Express Validator Middleware ---------- */

// Handle express-validator results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return res.status(400).json({
      success: false,
      errors: formattedErrors
    });
  }
  
  next();
};

/* ---------- Combined Middleware Functions ---------- */

// Registration with express-validator
export const validateRegistrationWithExpressValidator = [
  ...registrationRules,
  handleValidationErrors
];

// Password reset with express-validator
export const validatePasswordResetWithExpressValidator = [
  ...passwordResetRules,
  handleValidationErrors
];

/* ---------- Individual Field Validation Middleware ---------- */

// Email validation middleware
export const validateEmailField = (req, res, next) => {
  const { email } = req.body;
  const errors = validateEmail(email);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }
  
  next();
};

// Password validation middleware
export const validatePasswordField = (req, res, next) => {
  const { password } = req.body;
  const errors = validatePassword(password);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }
  
  next();
};

// Username validation middleware
export const validateUsernameField = (req, res, next) => {
  const { username } = req.body;
  const errors = validateUsername(username);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }
  
  next();
};

// Name validation middleware
export const validateNameField = (req, res, next) => {
  const { name } = req.body;
  const errors = validateName(name);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }
  
  next();
};
