import { Router, Request, Response } from 'express';
import * as craftService from './craft.service';

export const craftRouter = Router();

craftRouter.get('/recipes', async (req: Request, res: Response) => {
  try {
    const recipes = await craftService.getRecipes();
    res.json({ success: true, data: recipes });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

craftRouter.post('/upgrade', async (req: Request, res: Response) => {
  try {
    const { itemId, materialIds } = req.body;
    const upgraded = await craftService.upgradeItem(req.user!.userId, itemId, materialIds);
    res.json({ success: true, data: upgraded });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});
