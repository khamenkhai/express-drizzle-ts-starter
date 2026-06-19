import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';

import { authController } from './auth.controller';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validation';

const authRoutes = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Initiate registration with email verification
 * @access  Public
 */
authRoutes.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email with 6-digit code
 * @access  Public
 */
authRoutes.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
authRoutes.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
authRoutes.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
authRoutes.get('/profile', authenticate, authController.getProfile);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
authRoutes.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
authRoutes.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
authRoutes.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
authRoutes.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default authRoutes;
