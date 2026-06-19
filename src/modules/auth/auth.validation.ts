import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Verification code must be 6 digits'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
