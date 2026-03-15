import { Router } from 'express';
import * as challengeService from './challenge.service';

export const challengeRouter = Router();

challengeRouter.post('/send', async (req, res) => {
  try {
    const { friendId, goldStake } = req.body;
    const challenge = await challengeService.sendChallenge(req.user!.userId, friendId, goldStake);
    res.json({ success: true, data: challenge });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

challengeRouter.post('/:id/respond', async (req, res) => {
  try {
    const { accept } = req.body;
    const result = await challengeService.respondToChallenge(req.user!.userId, req.params.id, accept);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

challengeRouter.get('/pending', async (req, res) => {
  try {
    const challenges = await challengeService.getPendingChallenges(req.user!.userId);
    res.json({ success: true, data: challenges });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
