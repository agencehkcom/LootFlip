import type { Rarity } from './item';

export interface CraftRecipe {
  id: string;
  fromRarity: Rarity;
  toRarity: Rarity;
  goldCost: number;
  materialsRequired: number;
}

export const CRAFT_RECIPES: Omit<CraftRecipe, 'id'>[] = [
  { fromRarity: 'COMMON' as Rarity, toRarity: 'RARE' as Rarity, goldCost: 200, materialsRequired: 2 },
  { fromRarity: 'RARE' as Rarity, toRarity: 'EPIC' as Rarity, goldCost: 500, materialsRequired: 4 },
  { fromRarity: 'EPIC' as Rarity, toRarity: 'LEGENDARY' as Rarity, goldCost: 2000, materialsRequired: 8 },
  { fromRarity: 'LEGENDARY' as Rarity, toRarity: 'MYTHIC' as Rarity, goldCost: 5000, materialsRequired: 16 },
];
