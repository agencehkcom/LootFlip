import { PrismaClient } from '@prisma/client';
import {
  Rarity, ItemType, ItemTrait,
  DROP_RATES, PREMIUM_DROP_RATES, RARITY_BONUS_DAMAGE, GAME,
} from '@lootflip/shared';

const prisma = new PrismaClient();

export function calculateCurrentStock(
  dbStock: number,
  nextFreeAt: Date
): { stock: number; nextFreeAt: Date } {
  const now = Date.now();
  const nextFree = nextFreeAt.getTime();

  if (dbStock >= GAME.MAX_CHEST_STOCK) {
    return { stock: GAME.MAX_CHEST_STOCK, nextFreeAt };
  }

  if (now < nextFree) {
    return { stock: dbStock, nextFreeAt };
  }

  const elapsed = now - nextFree;
  const regenIntervalMs = GAME.CHEST_REGEN_MINUTES * 60 * 1000;
  const gained = 1 + Math.floor(elapsed / regenIntervalMs);
  const newStock = Math.min(dbStock + gained, GAME.MAX_CHEST_STOCK);

  const newNextFreeAt = newStock >= GAME.MAX_CHEST_STOCK
    ? nextFreeAt
    : new Date(nextFree + gained * regenIntervalMs);

  return { stock: newStock, nextFreeAt: newNextFreeAt };
}

function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function rollRarity(isPremium: boolean): Rarity {
  const rates = isPremium ? PREMIUM_DROP_RATES : DROP_RATES;
  return weightedRandom(rates) as Rarity;
}

export function rollType(): ItemType {
  const types = Object.values(ItemType);
  return types[Math.floor(Math.random() * types.length)];
}

export function rollTrait(): ItemTrait {
  const traits = Object.values(ItemTrait);
  return traits[Math.floor(Math.random() * traits.length)];
}

export async function openChest(userId: string, isPremium: boolean = false) {
  const chestState = await prisma.chestState.findUnique({ where: { userId } });
  if (!chestState) throw new Error('No chest state found');

  const { stock, nextFreeAt } = calculateCurrentStock(chestState.stock, chestState.nextFreeAt);
  if (stock <= 0) throw new Error('No chests available');

  const rarity = rollRarity(isPremium);
  const type = rollType();
  const trait = rollTrait();
  const bonusDamage = RARITY_BONUS_DAMAGE[rarity];

  const newStock = stock - 1;
  const regenIntervalMs = GAME.CHEST_REGEN_MINUTES * 60 * 1000;
  const newNextFreeAt = stock === GAME.MAX_CHEST_STOCK
    ? new Date(Date.now() + regenIntervalMs)
    : nextFreeAt;

  const [item] = await prisma.$transaction([
    prisma.item.create({
      data: { ownerId: userId, type, trait, rarity, bonusDamage },
    }),
    prisma.chestState.update({
      where: { userId },
      data: { stock: newStock, nextFreeAt: newNextFreeAt },
    }),
  ]);

  return { item, chestStock: newStock, nextChestAt: newNextFreeAt.toISOString() };
}
