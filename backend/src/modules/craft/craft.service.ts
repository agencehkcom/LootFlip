import { PrismaClient } from '@prisma/client';
import { CRAFT_RECIPES, RARITY_BONUS_DAMAGE, Rarity } from '@lootflip/shared';
import { GAME } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getRecipes() {
  return prisma.craftRecipe.findMany({
    orderBy: { goldCost: 'asc' },
  });
}

export async function upgradeItem(
  userId: string,
  itemId: string,
  materialIds: string[]
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('Item not found');
    if (item.ownerId !== userId) throw new Error('Not your item');
    if (item.isEquipped) throw new Error('Unequip item first');
    if (item.isListed) throw new Error('Item is listed on marketplace');
    if (item.rarity === 'MYTHIC') throw new Error('Item is already max rarity');

    // Find the matching recipe
    const recipe = CRAFT_RECIPES.find((r) => r.fromRarity === item.rarity);
    if (!recipe) throw new Error('No upgrade recipe for this rarity');

    // Validate materials count
    if (materialIds.length !== recipe.materialsRequired) {
      throw new Error(`Need exactly ${recipe.materialsRequired} materials`);
    }

    // Validate no duplicates and item not in materials
    const uniqueIds = new Set(materialIds);
    if (uniqueIds.size !== materialIds.length) {
      throw new Error('Duplicate materials');
    }
    if (uniqueIds.has(itemId)) {
      throw new Error('Cannot use the target item as material');
    }

    // Validate all materials
    const materials = await tx.item.findMany({
      where: { id: { in: materialIds } },
    });

    if (materials.length !== materialIds.length) {
      throw new Error('Some materials not found');
    }

    for (const mat of materials) {
      if (mat.ownerId !== userId) throw new Error('Material not owned by you');
      if (mat.isEquipped) throw new Error('Unequip material first');
      if (mat.isListed) throw new Error('Material is listed on marketplace');
      if (mat.rarity !== item.rarity) {
        throw new Error('All materials must be same rarity as target item');
      }
    }

    // Check gold
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.goldBalance < recipe.goldCost) {
      throw new Error('Insufficient gold');
    }

    // Deduct gold
    await tx.user.update({
      where: { id: userId },
      data: { goldBalance: { decrement: recipe.goldCost } },
    });

    // Delete materials
    await tx.item.deleteMany({
      where: { id: { in: materialIds } },
    });

    // Upgrade item
    const newRarity = recipe.toRarity as Rarity;
    const upgraded = await tx.item.update({
      where: { id: itemId },
      data: {
        rarity: newRarity,
        bonusDamage: RARITY_BONUS_DAMAGE[newRarity],
      },
    });

    return upgraded;
  });
}
