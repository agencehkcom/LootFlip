import { Router } from 'express';
import * as questService from './quest.service';

export const questRouter = Router();

questRouter.get('/', async (req, res) => {
  try {
    const quests = await questService.getDailyQuests(req.user!.userId);
    res.json({ success: true, data: quests });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

questRouter.post('/claim/:id', async (req, res) => {
  try {
    const quest = await questService.claimQuestReward(req.user!.userId, req.params.id);
    res.json({ success: true, data: quest });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
