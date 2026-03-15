import { Router } from 'express';
import * as tournamentService from './tournament.service';

export const tournamentRouter = Router();

// War routes
tournamentRouter.post('/war/declare', async (req, res) => {
  try {
    const { guildId, defenderGuildId } = req.body;
    const war = await tournamentService.declareWar(req.user!.userId, guildId, defenderGuildId);
    res.json({ success: true, data: war });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

tournamentRouter.post('/war/:id/respond', async (req, res) => {
  try {
    const { accept } = req.body;
    const war = await tournamentService.respondToWar(req.user!.userId, req.params.id, accept);
    res.json({ success: true, data: war });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

tournamentRouter.get('/war/:id', async (req, res) => {
  try {
    const war = await tournamentService.getWar(req.params.id);
    if (!war) return res.status(404).json({ success: false, error: 'War not found' });
    res.json({ success: true, data: war });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

// Tournament routes
tournamentRouter.get('/current', async (req, res) => {
  try {
    const tournament = await tournamentService.getCurrentTournament();
    res.json({ success: true, data: tournament });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

tournamentRouter.post('/register', async (req, res) => {
  try {
    const { guildId } = req.body;
    const tournament = await tournamentService.registerForTournament(req.user!.userId, guildId);
    res.json({ success: true, data: tournament });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
