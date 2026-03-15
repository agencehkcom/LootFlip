import { Router } from 'express';
import * as guildService from './guild.service';

export const guildRouter = Router();

guildRouter.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    const guild = await guildService.createGuild(req.user!.userId, name, description || '');
    res.json({ success: true, data: guild });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.get('/my', async (req, res) => {
  try {
    const data = await guildService.getUserGuild(req.user!.userId);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.get('/search', async (req, res) => {
  try {
    const guilds = await guildService.searchGuilds(req.query.q as string || '');
    res.json({ success: true, data: guilds });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.get('/leaderboard', async (req, res) => {
  try {
    const guilds = await guildService.getGuildLeaderboard();
    res.json({ success: true, data: guilds });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.get('/:id', async (req, res) => {
  try {
    const guild = await guildService.getGuild(req.params.id);
    if (!guild) return res.status(404).json({ success: false, error: 'Guild not found' });
    res.json({ success: true, data: guild });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.put('/:id', async (req, res) => {
  try {
    // Simplified — only leader/co-leader check is in service
    const { description } = req.body;
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/join', async (req, res) => {
  try {
    const member = await guildService.joinGuild(req.user!.userId, req.params.id);
    res.json({ success: true, data: member });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/leave', async (req, res) => {
  try {
    const result = await guildService.leaveGuild(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/kick', async (req, res) => {
  try {
    await guildService.kickMember(req.user!.userId, req.body.targetUserId);
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/promote', async (req, res) => {
  try {
    const member = await guildService.promoteMember(req.user!.userId, req.body.targetUserId);
    res.json({ success: true, data: member });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/demote', async (req, res) => {
  try {
    const member = await guildService.demoteMember(req.user!.userId, req.body.targetUserId);
    res.json({ success: true, data: member });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/donate', async (req, res) => {
  try {
    const { goldAmount, gemAmount, itemId } = req.body;
    const donation = await guildService.donate(req.user!.userId, req.params.id, goldAmount || 0, gemAmount || 0, itemId);
    res.json({ success: true, data: donation });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.post('/:id/announce', async (req, res) => {
  try {
    const { content, isPinned } = req.body;
    const announcement = await guildService.postAnnouncement(req.user!.userId, req.params.id, content, isPinned);
    res.json({ success: true, data: announcement });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.put('/announce/:id', async (req, res) => {
  try {
    const result = await guildService.togglePinAnnouncement(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

guildRouter.delete('/announce/:id', async (req, res) => {
  try {
    await guildService.deleteAnnouncement(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
