import { type Request, type Response, type NextFunction } from "express";

import { type AuthRequest } from "../../shared/types";
import { logger } from "../../shared/utils/logger";

import { authService } from "./auth.service";
import {
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
  type VerifyEmailInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
} from "./auth.validation";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);

      logger.info(`Registration initiated for: ${data.email}`);

      res.status(201).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as VerifyEmailInput;
      const result = await authService.verifyEmail(data);

      logger.info(`Email verified for: ${data.email}`);

      res.status(201).json({
        success: true,
        message: "Email verified successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);

      logger.info(`User logged in: ${result.user.email}`);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const user = await authService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  logout(_req: AuthRequest, res: Response) {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ForgotPasswordInput;
      const result = await authService.forgotPassword(data);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ResetPasswordInput;
      const result = await authService.resetPassword(data);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const data = req.body as ChangePasswordInput;
      const result = await authService.changePassword(req.user.id, data);

      logger.info(`Password changed for user: ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
