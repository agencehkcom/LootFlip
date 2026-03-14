export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  SPELL = 'SPELL',
}

export enum ItemTrait {
  BURN = 'BURN',
  FREEZE = 'FREEZE',
  LIGHTNING = 'LIGHTNING',
  SHADOW = 'SHADOW',
  HEAL = 'HEAL',
  POISON = 'POISON',
}

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
}

export interface Item {
  id: string;
  ownerId: string;
  type: ItemType;
  trait: ItemTrait;
  rarity: Rarity;
  bonusDamage: number;
  isEquipped: boolean;
  tradeableAt: string | null;
  createdAt: string;
}

export const RARITY_BONUS_DAMAGE: Record<Rarity, number> = {
  [Rarity.COMMON]: 1,
  [Rarity.RARE]: 2,
  [Rarity.EPIC]: 4,
  [Rarity.LEGENDARY]: 6,
  [Rarity.MYTHIC]: 8,
};

export const DROP_RATES: Record<Rarity, number> = {
  [Rarity.COMMON]: 55,
  [Rarity.RARE]: 25,
  [Rarity.EPIC]: 13,
  [Rarity.LEGENDARY]: 5,
  [Rarity.MYTHIC]: 2,
};

export const PREMIUM_DROP_RATES: Record<Rarity, number> = {
  [Rarity.COMMON]: 40,
  [Rarity.RARE]: 28,
  [Rarity.EPIC]: 18,
  [Rarity.LEGENDARY]: 8,
  [Rarity.MYTHIC]: 6,
};
