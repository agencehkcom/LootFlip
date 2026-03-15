import { Router } from 'express';
import * as friendService from './friend.service';

export const friendRouter = Router();

friendRouter.get('/', async (req, res) => {
  try {
    const friends = await friendService.getFriends(req.user!.userId);
    res.json({ success: true, data: friends });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

friendRouter.get('/requests', async (req, res) => {
  try {
    const requests = await friendService.getFriendRequests(req.user!.userId);
    res.json({ success: true, data: requests });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

friendRouter.post('/request', async (req, res) => {
  try {
    const { userId } = req.body;
    const request = await friendService.sendFriendRequest(req.user!.userId, userId);
    res.json({ success: true, data: request });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

friendRouter.post('/respond', async (req, res) => {
  try {
    const { friendshipId, accept } = req.body;
    const result = await friendService.respondToFriendRequest(req.user!.userId, friendshipId, accept);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

friendRouter.delete('/:id', async (req, res) => {
  try {
    await friendService.removeFriend(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

friendRouter.get('/recent', async (req, res) => {
  try {
    const recents = await friendService.getRecentOpponents(req.user!.userId);
    res.json({ success: true, data: recents });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
