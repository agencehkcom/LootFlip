import { Router } from 'express';
import * as prestigeService from './prestige.service';

export const prestigeRouter = Router();

prestigeRouter.get('/info', async (req, res) => {
  try {
    const info = await prestigeService.getPrestigeInfo(req.user!.userId);
    res.json({ success: true, data: info });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

prestigeRouter.post('/reset', async (req, res) => {
  try {
    const result = await prestigeService.activatePrestige(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
