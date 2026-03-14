import { Router } from 'express';
import { openChest } from './chest.service';

export const chestRouter = Router();

chestRouter.post('/open', async (req, res) => {
  try {
    const { isPremium } = req.body;
    const result = await openChest(req.user!.userId, isPremium || false);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
