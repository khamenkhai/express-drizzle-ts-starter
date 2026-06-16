import { TokenPair } from "../../shared/types";
import { ConflictError, UnauthorizedError } from "../../shared/types/error";
import {
  generateTokenPair,
  verifyRefreshToken,
} from "../../shared/utils/jwt.utils";
import {
  comparePassword,
  hashPassword,
} from "../../shared/utils/password.utils";
import { userService } from "../users/user.service";
import { LoginInput, RegisterInput } from "./auth.validation";

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userService.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await userService.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      age: 20,
    });

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role?.name ?? "",
    });

    return { user, tokens };
  }

  async login(data: LoginInput) {
    const user = await userService.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role?.name ?? "",
    });

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);

    return generateTokenPair({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
  }

  async getProfile(userId: number) {
    return await userService.getUserById(userId);
  }
}

export const authService = new AuthService();