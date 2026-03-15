import { Router } from 'express';
import * as analyticsService from './analytics.service';

export const analyticsRouter = Router();

analyticsRouter.get('/stats', async (req, res) => {
  try {
    const stats = await analyticsService.getStats();
    res.json({ success: true, data: stats });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

analyticsRouter.post('/track', async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    await analyticsService.trackEvent(req.user!.userId, eventType, metadata);
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
