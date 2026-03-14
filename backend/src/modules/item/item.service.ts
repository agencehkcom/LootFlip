import { PrismaClient, Item } from '@prisma/client';

const prisma = new PrismaClient();

export function validateEquip(item: Item, userId: string) {
  if (item.ownerId !== userId) throw new Error('Not your item');
  if (item.isEquipped) throw new Error('Already equipped');
}

export async function getInventory(userId: string) {
  return prisma.item.findMany({
    where: { ownerId: userId },
    orderBy: [{ isEquipped: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function equipItem(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item not found');

  validateEquip(item, userId);

  // Unequip current item of same type
  await prisma.item.updateMany({
    where: { ownerId: userId, type: item.type, isEquipped: true },
    data: { isEquipped: false },
  });

  // Equip new item
  return prisma.item.update({
    where: { id: itemId },
    data: { isEquipped: true },
  });
}

export async function unequipItem(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item not found');
  if (item.ownerId !== userId) throw new Error('Not your item');
  if (!item.isEquipped) throw new Error('Not equipped');

  return prisma.item.update({
    where: { id: itemId },
    data: { isEquipped: false },
  });
}
