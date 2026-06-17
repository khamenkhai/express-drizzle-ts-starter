import jwt from 'jsonwebtoken';

import { config } from '../../config/env';
import { type IUserPayload, type TokenPair } from '../types';
import { UnauthorizedError } from '../types/error';

export const generateAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const generateTokenPair = (payload: IUserPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): IUserPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as IUserPayload;
  } catch (_error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): IUserPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as IUserPayload;
  } catch (_error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

export const decodeToken = (token: string): IUserPayload | null => {
  try {
    return jwt.decode(token) as IUserPayload;
  } catch (_error) {
    return null;
  }
};