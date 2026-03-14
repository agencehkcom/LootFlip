import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserProfile } from './user.service';

const prisma = new PrismaClient();

export const userRouter = Router();

userRouter.get('/', async (req, res) => {
  try {
    const profile = await getUserProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

userRouter.get('/leaderboard', async (_req, res) => {
  const top = await prisma.user.findMany({
    orderBy: { trophies: 'desc' },
    take: 50,
    select: { id: true, username: true, displayName: true, elo: true, trophies: true },
  });
  res.json({ success: true, data: top });
});
