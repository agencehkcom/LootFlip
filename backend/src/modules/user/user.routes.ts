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

userRouter.post('/complete-tutorial', async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { hasCompletedTutorial: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

userRouter.get('/leaderboard', async (req, res) => {
  const league = req.query.league as string | undefined;
  const where = league ? { league: league as any } : {};

  const top = await prisma.user.findMany({
    where,
    orderBy: { trophies: 'desc' },
    take: 50,
    select: { id: true, username: true, displayName: true, elo: true, trophies: true, league: true },
  });
  res.json({ success: true, data: top });
});
