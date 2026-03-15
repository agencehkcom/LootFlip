import { PrismaClient } from '@prisma/client';
import { GAME } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function updateDynamicPrices() {
  const dynamicItems = await prisma.shopItem.findMany({
    where: { isDynamic: true },
  });

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 3600000);

  for (const item of dynamicItems) {
    // Count purchases in last 24h
    const recentPurchases = await prisma.purchase.count({
      where: {
        shopItemId: item.id,
        createdAt: { gte: oneDayAgo },
      },
    });

    // Get average daily purchases over all time
    const totalPurchases = await prisma.purchase.count({
      where: { shopItemId: item.id },
    });

    const daysSinceCreation = Math.max(
      1,
      (now.getTime() - item.createdAt.getTime()) / (24 * 3600000)
    );
    const avgDaily = totalPurchases / daysSinceCreation;

    // Calculate demand multiplier
    let multiplier = avgDaily > 0 ? recentPurchases / avgDaily : 1;
    multiplier = Math.max(GAME.PRICE_MULTIPLIER_MIN, Math.min(GAME.PRICE_MULTIPLIER_MAX, multiplier));

    const newPrice = Math.max(1, Math.round(item.basePrice * multiplier));

    // Update price
    await prisma.shopItem.update({
      where: { id: item.id },
      data: { currentPrice: newPrice },
    });

    // Record price history
    await prisma.priceHistory.create({
      data: {
        shopItemId: item.id,
        price: newPrice,
      },
    });
  }

  // Cleanup old price history
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GAME.PRICE_HISTORY_DAYS);
  await prisma.priceHistory.deleteMany({
    where: { recordedAt: { lt: cutoff } },
  });
}

export async function expireListings() {
  const now = new Date();

  const expired = await prisma.marketListing.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: now },
    },
  });

  for (const listing of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: { id: listing.itemId },
        data: { isListed: false },
      });

      await tx.marketListing.update({
        where: { id: listing.id },
        data: { status: 'EXPIRED' },
      });

      await tx.marketOffer.updateMany({
        where: { listingId: listing.id, status: 'PENDING' },
        data: { status: 'EXPIRED' },
      });
    });
  }

  return expired.length;
}

export async function expireOffers() {
  const now = new Date();

  const result = await prisma.marketOffer.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });

  return result.count;
}

// Seed initial shop items
export async function seedShopItems() {
  const existingCount = await prisma.shopItem.count();
  if (existingCount > 0) return;

  const items = [
    // Chests
    {
      category: 'CHEST' as const,
      name: 'Coffre Premium Or',
      description: 'Meilleurs taux de drop. Achetable en or.',
      basePrice: 500,
      currency: 'GOLD' as const,
      currentPrice: 500,
      isDynamic: true,
      metadata: { chestType: 'gold_premium' },
    },
    {
      category: 'CHEST' as const,
      name: 'Coffre Premium Gem',
      description: 'Les meilleurs taux de drop possibles. Achetable en gemmes.',
      basePrice: 10,
      currency: 'GEM' as const,
      currentPrice: 10,
      isDynamic: true,
      metadata: { chestType: 'gem_premium' },
    },
    // Consumables
    {
      category: 'CONSUMABLE' as const,
      name: 'Potion de Soin',
      description: '+20 HP en combat (1 par combat, max 100 HP)',
      basePrice: GAME.POTION_BASE_PRICE,
      currency: 'GOLD' as const,
      currentPrice: GAME.POTION_BASE_PRICE,
      isDynamic: true,
      metadata: { consumableType: 'potion' },
    },
    // Cosmetics — Titles
    {
      category: 'COSMETIC' as const,
      name: 'Le Flamboyant',
      description: 'Titre rare affiché sur votre profil',
      basePrice: 50,
      currency: 'GEM' as const,
      currentPrice: 50,
      isDynamic: false,
      metadata: { cosmeticType: 'TITLE', cosmeticData: { title: 'Le Flamboyant' } },
    },
    {
      category: 'COSMETIC' as const,
      name: 'Roi des Ombres',
      description: 'Titre légendaire affiché sur votre profil',
      basePrice: 100,
      currency: 'GEM' as const,
      currentPrice: 100,
      isDynamic: false,
      metadata: { cosmeticType: 'TITLE', cosmeticData: { title: 'Roi des Ombres' } },
    },
    {
      category: 'COSMETIC' as const,
      name: 'Chasseur de Mythiques',
      description: 'Titre épique affiché sur votre profil',
      basePrice: 200,
      currency: 'GEM' as const,
      currentPrice: 200,
      isDynamic: false,
      metadata: { cosmeticType: 'TITLE', cosmeticData: { title: 'Chasseur de Mythiques' } },
    },
    // Cosmetics — Frames
    {
      category: 'COSMETIC' as const,
      name: 'Cadre Doré',
      description: 'Bordure dorée autour de votre avatar',
      basePrice: 75,
      currency: 'GEM' as const,
      currentPrice: 75,
      isDynamic: false,
      metadata: { cosmeticType: 'FRAME', cosmeticData: { frame: 'gold_border' } },
    },
    {
      category: 'COSMETIC' as const,
      name: 'Cadre Infernal',
      description: 'Bordure enflammée autour de votre avatar',
      basePrice: 150,
      currency: 'GEM' as const,
      currentPrice: 150,
      isDynamic: false,
      metadata: { cosmeticType: 'FRAME', cosmeticData: { frame: 'fire_border' } },
    },
    // Cosmetics — Effects
    {
      category: 'COSMETIC' as const,
      name: 'Effet Foudre',
      description: 'Éclairs quand vous gagnez un round',
      basePrice: 100,
      currency: 'GEM' as const,
      currentPrice: 100,
      isDynamic: false,
      metadata: { cosmeticType: 'EFFECT', cosmeticData: { effect: 'lightning_win' } },
    },
    {
      category: 'COSMETIC' as const,
      name: 'Effet Flammes',
      description: 'Flammes quand vous gagnez un round',
      basePrice: 100,
      currency: 'GEM' as const,
      currentPrice: 100,
      isDynamic: false,
      metadata: { cosmeticType: 'EFFECT', cosmeticData: { effect: 'fire_win' } },
    },
  ];

  await prisma.shopItem.createMany({ data: items });
}

// Seed craft recipes
export async function seedCraftRecipes() {
  const existingCount = await prisma.craftRecipe.count();
  if (existingCount > 0) return;

  const recipes = [
    { fromRarity: 'COMMON' as const, toRarity: 'RARE' as const, goldCost: 200, materialsRequired: 2 },
    { fromRarity: 'RARE' as const, toRarity: 'EPIC' as const, goldCost: 500, materialsRequired: 4 },
    { fromRarity: 'EPIC' as const, toRarity: 'LEGENDARY' as const, goldCost: 2000, materialsRequired: 8 },
    { fromRarity: 'LEGENDARY' as const, toRarity: 'MYTHIC' as const, goldCost: 5000, materialsRequired: 16 },
  ];

  await prisma.craftRecipe.createMany({ data: recipes });
}
