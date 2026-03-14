import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../modules/auth/auth.service';
import { ENV } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing token' });
  }
  try {
    req.user = verifyJwt(header.slice(7), ENV.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
