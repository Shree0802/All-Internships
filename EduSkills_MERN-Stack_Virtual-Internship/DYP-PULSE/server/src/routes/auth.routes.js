import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  addressSchema
} from '../validators/auth.validator.js';

const router = Router();

// Rate limiter for authentication attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// Public auth endpoints
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email/:token', authLimiter, authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerificationEmail);
router.get('/csrf-token', authController.getCsrfToken);

// Protected profile & identity endpoints
router.get('/me', requireAuth, authController.getMe);
router.get('/profile', requireAuth, authController.getMe);
router.put('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);

// Delivery address management endpoints
router.get('/addresses', requireAuth, authController.getAddresses);
router.post('/addresses', requireAuth, validate(addressSchema), authController.addAddress);
router.put('/addresses/:addressId', requireAuth, validate(addressSchema.partial()), authController.updateAddress);
router.put('/addresses/:addressId/default', requireAuth, authController.setDefaultAddress);
router.delete('/addresses/:addressId', requireAuth, authController.deleteAddress);

// Admin-only customer and account management endpoints
router.get('/admin/users', requireAuth, requireAdmin, authController.getAllUsers);
router.put('/admin/users/:id/status', requireAuth, requireAdmin, authController.updateUserStatus);
router.get('/admin/users/:id', requireAuth, requireAdmin, authController.getUserDetails);

export default router;
