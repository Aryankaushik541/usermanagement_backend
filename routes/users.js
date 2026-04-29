const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation for profile update
const profileUpdateValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters')
    .isLength({ max: 100 }).withMessage('Full name cannot exceed 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
];

// Validation for password change
const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// User profile routes (accessible by authenticated users)
router.get('/profile', userController.getProfile);
router.put('/profile', profileUpdateValidation, userController.updateProfile);
router.put('/password', passwordChangeValidation, userController.changePassword);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', authorize('admin'), userController.getUserById);
router.put('/:id/activate', authorize('admin'), userController.activateUser);
router.put('/:id/deactivate', authorize('admin'), userController.deactivateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;