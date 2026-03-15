import { Router } from 'express';
import * as walletService from './wallet.service';

export const walletRouter = Router();

walletRouter.post('/create', async (req, res) => {
  try {
    const wallet = await walletService.createCustodialWallet(req.user!.userId);
    res.json({ success: true, data: { id: wallet.id, type: wallet.type, address: wallet.address } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

walletRouter.post('/connect', async (req, res) => {
  try {
    const { address } = req.body;
    const wallet = await walletService.connectExternalWallet(req.user!.userId, address);
    res.json({ success: true, data: { id: wallet.id, type: wallet.type, address: wallet.address } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

walletRouter.get('/info', async (req, res) => {
  try {
    const info = await walletService.getWalletInfo(req.user!.userId);
    res.json({ success: true, data: info });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

walletRouter.post('/disconnect', async (req, res) => {
  try {
    await walletService.disconnectWallet(req.user!.userId);
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});
