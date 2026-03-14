import { describe, it, expect } from 'vitest';
import { calculateCurrentStock, rollRarity, rollType, rollTrait } from './chest.service';
import { Rarity, ItemType, ItemTrait, GAME } from '@lootflip/shared';

describe('chest.service', () => {
  describe('calculateCurrentStock', () => {
    it('should return max stock if enough time has passed', () => {
      const pastDate = new Date(Date.now() - 5 * 30 * 60 * 1000);
      const result = calculateCurrentStock(0, pastDate);
      expect(result.stock).toBe(GAME.MAX_CHEST_STOCK);
    });

    it('should not exceed max stock', () => {
      const pastDate = new Date(Date.now() - 10 * 30 * 60 * 1000);
      const result = calculateCurrentStock(3, pastDate);
      expect(result.stock).toBe(GAME.MAX_CHEST_STOCK);
    });

    it('should return current stock if no time has passed', () => {
      const now = new Date(Date.now() + 60 * 1000);
      const result = calculateCurrentStock(2, now);
      expect(result.stock).toBe(2);
    });
  });

  describe('rollRarity', () => {
    it('should return a valid rarity', () => {
      const rarity = rollRarity(false);
      expect(Object.values(Rarity)).toContain(rarity);
    });
  });

  describe('rollType', () => {
    it('should return a valid item type', () => {
      const type = rollType();
      expect(Object.values(ItemType)).toContain(type);
    });
  });

  describe('rollTrait', () => {
    it('should return a valid trait', () => {
      const trait = rollTrait();
      expect(Object.values(ItemTrait)).toContain(trait);
    });
  });
});
