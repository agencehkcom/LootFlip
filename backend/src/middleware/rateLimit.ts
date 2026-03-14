import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId || req.ip;
    const key = `rate:${req.path}:${userId}`;
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSeconds);
    if (current > maxRequests) {
      return res.status(429).json({ success: false, error: 'Too many requests' });
    }
    next();
  };
}
