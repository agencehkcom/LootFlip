import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getBattle } from './battle.service';

const prisma = new PrismaClient();

export const battleRouter = Router();

battleRouter.get('/history', async (req, res) => {
  const userId = req.user!.userId;
  const battles = await prisma.battle.findMany({
    where: {
      OR: [{ player1Id: userId }, { player2Id: userId }],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      player1Id: true,
      player2Id: true,
      winnerId: true,
      goldStake: true,
      eloChange: true,
      isBotMatch: true,
      createdAt: true,
      player1: { select: { username: true, displayName: true } },
      player2: { select: { username: true, displayName: true } },
    },
  });

  const history = battles.map(b => {
    const isPlayer1 = b.player1Id === userId;
    const opponent = isPlayer1 ? b.player2 : b.player1;
    const won = b.winnerId === userId;
    const draw = b.winnerId === null;
    const eloChange = isPlayer1 ? b.eloChange : -b.eloChange;

    return {
      id: b.id,
      opponent: opponent.displayName || opponent.username || 'Anonyme',
      result: draw ? 'draw' : won ? 'win' : 'loss',
      goldStake: b.goldStake,
      eloChange,
      isBotMatch: b.isBotMatch,
      createdAt: b.createdAt.toISOString(),
    };
  });

  res.json({ success: true, data: history });
});

battleRouter.get('/:id', async (req, res) => {
  const battle = await getBattle(req.params.id);
  if (!battle) {
    return res.status(404).json({ success: false, error: 'Battle not found' });
  }
  res.json({ success: true, data: battle });
});
