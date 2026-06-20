import crypto from "crypto";

import { prisma } from "../../db";
import { config } from "../../config/env";
import { type TokenPair } from "../../shared/types";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/types/error";
import {
  generateTokenPair,
  verifyRefreshToken,
} from "../../shared/utils/jwt.utils";
import {
  comparePassword,
  hashPassword,
} from "../../shared/utils/password.utils";
import { logger } from "../../shared/utils/logger";
import { sendMail } from "../../shared/services/mailer";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
} from "../../shared/services/emailTemplates";
import { userService } from "../users/user.service";

import {
  type LoginInput,
  type RegisterInput,
  type VerifyEmailInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
} from "./auth.validation";

const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const parseExpiresIn = (value: string): number => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 15 * 60 * 1000;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
};

const storeRefreshToken = async (
  token: string,
  userId: number,
): Promise<void> => {
  const expiresAt = new Date(
    Date.now() + parseExpiresIn(config.jwt.refreshExpiresIn),
  );
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userService.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    await prisma.verificationToken.deleteMany({
      where: { email: data.email },
    });

    const code = generateVerificationCode();

    const hashedPassword = await hashPassword(data.password);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        email: data.email,
        code,
        password: hashedPassword,
        name: data.name,
        expiresAt,
      },
    });

    const html = verificationEmailTemplate(code, data.name);

    await sendMail({
      to: data.email,
      subject: "Verify your email address",
      html,
    });

    logger.info(`Verification code sent to ${data.email}`);

    return { status: true, message: "Verification code sent to your email" };
  }

  async verifyEmail(data: VerifyEmailInput) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        email_code: {
          email: data.email,
          code: data.code,
        },
      },
    });

    if (!verificationToken) {
      throw new BadRequestError("Invalid verification code");
    }

    if (new Date() > verificationToken.expiresAt) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestError("Verification code has expired");
    }

    const existingUser = await userService.getUserByEmail(data.email);
    if (existingUser) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new ConflictError("User with this email already exists");
    }

    const user = await prisma.user.create({
      data: {
        name: verificationToken.name,
        email: data.email,
        password: verificationToken.password,
        age: 20,
        emailVerified: true,
      },
      include: { role: true },
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    const permissions = await userService.getUserPermissions(user.id);

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role?.id ?? "",
      permissions,
    });

    await storeRefreshToken(tokens.refreshToken, user.id);

    const { password: _password, ...userWithoutPassword } = user;

    logger.info(`Email verified and user created: ${data.email}`);

    return { user: userWithoutPassword, tokens };
  }

  async login(data: LoginInput) {
    const user = await userService.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError("Please verify your email before logging in");
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const permissions = await userService.getUserPermissions(user.id);

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role?.id ?? "",
      permissions,
    });

    await storeRefreshToken(tokens.refreshToken, user.id);

    const { password: _password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedError("Refresh token has been revoked");
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError("Refresh token has expired");
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const permissions = await userService.getUserPermissions(payload.id);

    const tokens = generateTokenPair({
      id: payload.id,
      email: payload.email,
      role: payload.role,
      permissions,
    });

    await storeRefreshToken(tokens.refreshToken, payload.id);

    return tokens;
  }

  async getProfile(userId: number) {
    return await userService.getUserById(userId);
  }

  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revokedAt: new Date() },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { message: "Logout successful" };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await userService.getUserByEmail(data.email);
    if (!user) {
      return { message: "If the email exists, a reset link has been sent" };
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = generateResetToken();
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;
    const html = passwordResetEmailTemplate(resetUrl, user.name);

    await sendMail({
      to: user.email,
      subject: "Reset your password",
      html,
    });

    logger.info(`Password reset email sent to ${data.email}`);

    return {
      message: "If the email exists, a reset link has been sent",
      resetToken: rawToken,
    };
  }

  async resetPassword(data: ResetPasswordInput) {
    const hashedToken = hashToken(data.token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new BadRequestError("Reset token has expired");
    }

    if (resetToken.usedAt) {
      throw new BadRequestError("Reset token has already been used");
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId },
        data: { revokedAt: new Date() },
      }),
    ]);

    logger.info(`Password reset for user: ${resetToken.user.email}`);

    return { message: "Password has been reset successfully" };
  }

  async changePassword(userId: number, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await comparePassword(
      data.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      }),
    ]);

    logger.info(`Password changed for user: ${user.email}`);

    return { message: "Password has been changed successfully" };
  }
}

export const authService = new AuthService();
