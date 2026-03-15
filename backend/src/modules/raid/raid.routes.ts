import { Router } from 'express';
import * as raidService from './raid.service';

export const raidRouter = Router();

raidRouter.get('/bosses', async (req, res) => {
  try {
    const bosses = await raidService.getBosses();
    res.json({ success: true, data: bosses });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

raidRouter.post('/start', async (req, res) => {
  try {
    const { guildId, bossId, difficulty } = req.body;
    const raid = await raidService.startRaid(req.user!.userId, guildId, bossId, difficulty);
    res.json({ success: true, data: raid });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

raidRouter.get('/active', async (req, res) => {
  try {
    const { guildId } = req.query;
    const raid = await raidService.getActiveRaid(guildId as string);
    res.json({ success: true, data: raid });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

raidRouter.get('/:id', async (req, res) => {
  try {
    const raid = await raidService.getRaid(req.params.id);
    if (!raid) return res.status(404).json({ success: false, error: 'Raid not found' });
    res.json({ success: true, data: raid });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

raidRouter.post('/attempt', async (req, res) => {
  try {
    const { raidId } = req.body;
    const result = await raidService.attemptRaid(req.user!.userId, raidId);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

raidRouter.post('/:id/claim', async (req, res) => {
  try {
    const reward = await raidService.claimRaidReward(req.user!.userId, req.params.id);
    res.json({ success: true, data: reward });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
