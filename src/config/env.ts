import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5001'),
  API_VERSION: z.string().default('v1'),
  
  DATABASE_URL: z.string().optional(),
  
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  ALLOWED_ORIGINS: z.string().default('http://localhost:5001'),
  
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),

  MAIL_HOST: z.string().default('smtp.gmail.com'),
  MAIL_PORT: z.string().transform(Number).default('587'),
  MAIL_USER: z.string().default(''),
  MAIL_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('noreply@example.com'),

  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  
  database: {
    url: env.DATABASE_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  cors: {
    origins: env.ALLOWED_ORIGINS.split(','),
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  mail: {
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
    from: env.MAIL_FROM,
  },

  frontendUrl: env.FRONTEND_URL,
};