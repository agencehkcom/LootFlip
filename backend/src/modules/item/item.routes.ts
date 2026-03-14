import { Router } from 'express';
import { getInventory, equipItem, unequipItem } from './item.service';

export const itemRouter = Router();

itemRouter.get('/', async (req, res) => {
  const items = await getInventory(req.user!.userId);
  res.json({ success: true, data: items });
});

itemRouter.post('/equip', async (req, res) => {
  try {
    const item = await equipItem(req.user!.userId, req.body.itemId);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

itemRouter.post('/unequip', async (req, res) => {
  try {
    const item = await unequipItem(req.user!.userId, req.body.itemId);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
