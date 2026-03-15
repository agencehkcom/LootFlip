import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getInventory, equipItem, unequipItem } from './item.service';

const prisma = new PrismaClient();
export const itemRouter = Router();

itemRouter.get('/', async (req, res) => {
  const items = await getInventory(req.user!.userId);
  res.json({ success: true, data: items });
});

itemRouter.get('/cosmetics', async (req, res) => {
  const cosmetics = await prisma.cosmetic.findMany({
    where: { ownerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: cosmetics });
});

itemRouter.post('/cosmetics/equip', async (req, res) => {
  try {
    const { cosmeticId } = req.body;
    const cosmetic = await prisma.cosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic || cosmetic.ownerId !== req.user!.userId) {
      return res.status(400).json({ success: false, error: 'Cosmetic not found' });
    }
    // Unequip same type first
    await prisma.cosmetic.updateMany({
      where: { ownerId: req.user!.userId, type: cosmetic.type, equippedAt: { not: null } },
      data: { equippedAt: null },
    });
    const updated = await prisma.cosmetic.update({
      where: { id: cosmeticId },
      data: { equippedAt: new Date() },
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

itemRouter.post('/cosmetics/unequip', async (req, res) => {
  try {
    const { cosmeticId } = req.body;
    const cosmetic = await prisma.cosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic || cosmetic.ownerId !== req.user!.userId) {
      return res.status(400).json({ success: false, error: 'Cosmetic not found' });
    }
    const updated = await prisma.cosmetic.update({
      where: { id: cosmeticId },
      data: { equippedAt: null },
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
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
