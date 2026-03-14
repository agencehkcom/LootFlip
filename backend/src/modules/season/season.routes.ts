import { Router } from 'express';
import { getPlayerSeasonInfo, getUnclaimedRewards, claimRewards } from './season.service';

export const seasonRouter = Router();

seasonRouter.get('/current', async (req, res) => {
  try {
    const info = await getPlayerSeasonInfo(req.user!.userId);
    res.json({ success: true, data: info });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

seasonRouter.get('/rewards', async (req, res) => {
  const rewards = await getUnclaimedRewards(req.user!.userId);
  res.json({ success: true, data: rewards });
});

seasonRouter.post('/claim', async (req, res) => {
  try {
    const result = await claimRewards(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
