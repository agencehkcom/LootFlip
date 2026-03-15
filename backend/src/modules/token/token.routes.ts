import { Router } from 'express';
import * as tokenService from './token.service';

export const tokenRouter = Router();

tokenRouter.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    const tx = await tokenService.withdrawGem(req.user!.userId, amount);
    res.json({ success: true, data: tx });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

tokenRouter.post('/deposit/confirm', async (req, res) => {
  try {
    const { amount, txHash } = req.body;
    const tx = await tokenService.confirmDeposit(req.user!.userId, amount, txHash);
    res.json({ success: true, data: tx });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

tokenRouter.get('/transactions', async (req, res) => {
  try {
    const txs = await tokenService.getTransactions(req.user!.userId);
    res.json({ success: true, data: txs });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

tokenRouter.get('/stats', async (req, res) => {
  try {
    const stats = await tokenService.getTokenStats();
    res.json({ success: true, data: stats });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
