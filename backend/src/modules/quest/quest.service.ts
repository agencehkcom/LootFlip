import { PrismaClient } from '@prisma/client';
import { QUEST_REWARDS } from '@lootflip/shared';

const prisma = new PrismaClient();

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDailyQuests(userId: string) {
  const today = getToday();

  // Ensure quests exist for today
  const existing = await prisma.dailyQuest.findMany({
    where: { userId, date: today },
  });

  if (existing.length === 0) {
    await prisma.dailyQuest.createMany({
      data: [
        { userId, date: today, questType: 'LOGIN' },
        { userId, date: today, questType: 'FIRST_WIN' },
        { userId, date: today, questType: 'THREE_BATTLES' },
      ],
    });
    // Auto-complete LOGIN quest
    await prisma.dailyQuest.update({
      where: { userId_date_questType: { userId, date: today, questType: 'LOGIN' } },
      data: { completed: true },
    });
    // Update last login
    await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  }

  return prisma.dailyQuest.findMany({
    where: { userId, date: today },
    orderBy: { questType: 'asc' },
  });
}

export async function completeQuest(userId: string, questType: 'LOGIN' | 'FIRST_WIN' | 'THREE_BATTLES') {
  const today = getToday();

  const quest = await prisma.dailyQuest.findUnique({
    where: { userId_date_questType: { userId, date: today, questType } },
  });
  if (!quest) throw new Error('Quest not found');
  if (quest.completed) return quest;

  return prisma.dailyQuest.update({
    where: { id: quest.id },
    data: { completed: true },
  });
}

export async function claimQuestReward(userId: string, questId: string) {
  const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } });
  if (!quest || quest.userId !== userId) throw new Error('Quest not found');
  if (!quest.completed) throw new Error('Quest not completed');
  if (quest.rewardClaimed) throw new Error('Already claimed');

  const reward = QUEST_REWARDS[quest.questType as keyof typeof QUEST_REWARDS];

  return prisma.$transaction(async (tx) => {
    if (reward.gold) {
      await tx.user.update({
        where: { id: userId },
        data: { goldBalance: { increment: reward.gold } },
      });
    }

    if (reward.chests) {
      const chestState = await tx.chestState.findUnique({ where: { userId } });
      if (chestState) {
        await tx.chestState.update({
          where: { userId },
          data: { stock: { increment: reward.chests } },
        });
      }
    }

    return tx.dailyQuest.update({
      where: { id: questId },
      data: { rewardClaimed: true },
    });
  });
}
