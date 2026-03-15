import { PrismaClient } from '@prisma/client';
import { GAME, Rarity, RARITY_BONUS_DAMAGE, ItemType, ItemTrait } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getShopItems() {
  return prisma.shopItem.findMany({
    orderBy: [{ category: 'asc' }, { currentPrice: 'asc' }],
  });
}

export async function buyShopItem(userId: string, shopItemId: string) {
  return prisma.$transaction(async (tx) => {
    const shopItem = await tx.shopItem.findUnique({ where: { id: shopItemId } });
    if (!shopItem) throw new Error('Shop item not found');

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const balanceField = shopItem.currency === 'GOLD' ? 'goldBalance' : 'gemBalance';
    if ((user as any)[balanceField] < shopItem.currentPrice) {
      throw new Error('Insufficient balance');
    }

    // Debit user
    await tx.user.update({
      where: { id: userId },
      data: { [balanceField]: { decrement: shopItem.currentPrice } },
    });

    // Record purchase
    await tx.purchase.create({
      data: {
        userId,
        shopItemId,
        pricePaid: shopItem.currentPrice,
        currency: shopItem.currency,
      },
    });

    // Deliver the item based on category
    let deliveredItem: any = null;

    if (shopItem.category === 'CHEST') {
      deliveredItem = await deliverChest(tx, userId, shopItem);
    } else if (shopItem.category === 'CONSUMABLE') {
      deliveredItem = await deliverConsumable(tx, userId, shopItem);
    } else if (shopItem.category === 'COSMETIC') {
      deliveredItem = await deliverCosmetic(tx, userId, shopItem);
    }

    return { shopItem, deliveredItem, pricePaid: shopItem.currentPrice };
  });
}

async function deliverChest(tx: any, userId: string, shopItem: any) {
  const metadata = shopItem.metadata as any;
  const isPremiumGem = shopItem.name.includes('Gem');

  // Use premium drop rates for gem chests, slightly better for gold chests
  const dropRates = isPremiumGem
    ? { COMMON: 30, RARE: 28, EPIC: 22, LEGENDARY: 12, MYTHIC: 8 }
    : { COMMON: 40, RARE: 28, EPIC: 18, LEGENDARY: 8, MYTHIC: 6 };

  const rarity = weightedRandom(dropRates);
  const types = Object.values(ItemType);
  const traits = Object.values(ItemTrait);

  const item = await tx.item.create({
    data: {
      ownerId: userId,
      type: types[Math.floor(Math.random() * types.length)],
      trait: traits[Math.floor(Math.random() * traits.length)],
      rarity,
      bonusDamage: RARITY_BONUS_DAMAGE[rarity as Rarity],
      tradeableAt: new Date(Date.now() + GAME.MARKET_TRADEABLE_COOLDOWN_HOURS * 3600000),
    },
  });

  return item;
}

async function deliverConsumable(tx: any, userId: string, shopItem: any) {
  // Potion — increment user's potion count
  await tx.user.update({
    where: { id: userId },
    data: { potionCount: { increment: 1 } },
  });
  return { type: 'potion', quantity: 1 };
}

async function deliverCosmetic(tx: any, userId: string, shopItem: any) {
  const metadata = shopItem.metadata as any;
  const cosmetic = await tx.cosmetic.create({
    data: {
      ownerId: userId,
      type: metadata?.cosmeticType || 'TITLE',
      name: shopItem.name,
      metadata: metadata?.cosmeticData || null,
    },
  });
  return cosmetic;
}

function weightedRandom(rates: Record<string, number>): string {
  const total = Object.values(rates).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of Object.entries(rates)) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return Object.keys(rates)[0];
}

export async function getPriceHistory(shopItemId: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GAME.PRICE_HISTORY_DAYS);

  return prisma.priceHistory.findMany({
    where: {
      shopItemId,
      recordedAt: { gte: cutoff },
    },
    orderBy: { recordedAt: 'asc' },
  });
}
