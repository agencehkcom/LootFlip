import { Router, Request, Response } from 'express';
import * as shopService from './shop.service';

export const shopRouter = Router();

shopRouter.get('/items', async (req: Request, res: Response) => {
  try {
    const items = await shopService.getShopItems();
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

shopRouter.post('/buy/:id', async (req: Request, res: Response) => {
  try {
    const result = await shopService.buyShopItem(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

shopRouter.get('/prices/history/:id', async (req: Request, res: Response) => {
  try {
    const history = await shopService.getPriceHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});
