import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../.env' });

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'dev_token',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_fallback_secret',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
