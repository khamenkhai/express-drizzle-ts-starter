import { type Request } from "express";

export interface IUserPayload {
  id: number;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
