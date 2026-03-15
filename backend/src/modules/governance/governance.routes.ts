import { Router } from 'express';
import * as governanceService from './governance.service';

export const governanceRouter = Router();

governanceRouter.post('/propose', async (req, res) => {
  try {
    const { title, description, category, options } = req.body;
    const proposal = await governanceService.createProposal(req.user!.userId, title, description, category, options);
    res.json({ success: true, data: proposal });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

governanceRouter.post('/vote/:id', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const vote = await governanceService.vote(req.user!.userId, req.params.id, optionIndex);
    res.json({ success: true, data: vote });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

governanceRouter.get('/proposals', async (req, res) => {
  try {
    const proposals = await governanceService.getProposals(req.query.status as string);
    res.json({ success: true, data: proposals });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

governanceRouter.get('/proposals/:id', async (req, res) => {
  try {
    const proposal = await governanceService.getProposal(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
    res.json({ success: true, data: proposal });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
