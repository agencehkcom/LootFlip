import { Router } from 'express';
import * as eventService from './event.service';

export const eventRouter = Router();

eventRouter.get('/active', async (req, res) => {
  try {
    const events = await eventService.getActiveEvents();
    res.json({ success: true, data: events });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

eventRouter.get('/history', async (req, res) => {
  try {
    const events = await eventService.getEventHistory();
    res.json({ success: true, data: events });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

eventRouter.get('/:id', async (req, res) => {
  try {
    const event = await eventService.getEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

eventRouter.post('/:id/participate', async (req, res) => {
  try {
    const result = await eventService.participate(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

eventRouter.post('/:id/claim', async (req, res) => {
  try {
    const result = await eventService.claimEventReward(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
