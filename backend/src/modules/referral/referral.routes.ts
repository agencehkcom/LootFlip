import { Router } from 'express';
import * as referralService from './referral.service';

export const referralRouter = Router();

referralRouter.get('/info', async (req, res) => {
  try {
    const info = await referralService.getReferralInfo(req.user!.userId);
    res.json({ success: true, data: info });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

referralRouter.post('/airdrop', async (req, res) => {
  try {
    const result = await referralService.claimAirdrop(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
