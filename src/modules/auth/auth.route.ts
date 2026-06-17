import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';

import { authController } from './auth.controller';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const authRoutes = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
authRoutes.post('/register', validate(registerSchema), authController.register);

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

export default authRoutes;