import { type Request, type Response } from "express";

import { type AuthRequest } from "../../shared/types";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { logger } from "../../shared/utils/logger";

import { authService } from "./auth.service";
import {
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
} from "./auth.validation";

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as RegisterInput;
    const result = await authService.register(data);

    logger.info(`User registered: ${result.user.email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as LoginInput;
    const result = await authService.login(data);

    logger.info(`User logged in: ${result.user.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as RefreshTokenInput;
    const tokens = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: tokens,
    });
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  logout = (req: AuthRequest, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  };
}

export const authController = new AuthController();
