import { Router } from 'express';
import { authenticateUser } from './auth.service';
import { ENV } from '../../config/env';

export const authRouter = Router();

authRouter.post('/', async (req, res) => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ success: false, error: 'Missing initData' });
    }
    const result = await authenticateUser(initData, ENV.TELEGRAM_BOT_TOKEN, ENV.JWT_SECRET);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});
