import { Router } from 'express';
import * as stakingService from './staking.service';

export const stakingRouter = Router();

stakingRouter.post('/stake', async (req, res) => {
  try {
    const { amount, lockDays } = req.body;
    const position = await stakingService.stake(req.user!.userId, amount, lockDays);
    res.json({ success: true, data: position });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

stakingRouter.post('/unstake/:id', async (req, res) => {
  try {
    const position = await stakingService.unstake(req.user!.userId, req.params.id);
    res.json({ success: true, data: position });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

stakingRouter.post('/claim/:id', async (req, res) => {
  try {
    const position = await stakingService.claimRewards(req.user!.userId, req.params.id);
    res.json({ success: true, data: position });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

stakingRouter.get('/positions', async (req, res) => {
  try {
    const positions = await stakingService.getPositions(req.user!.userId);
    res.json({ success: true, data: positions });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

stakingRouter.get('/info', async (req, res) => {
  try {
    const info = await stakingService.getStakingInfo();
    res.json({ success: true, data: info });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
