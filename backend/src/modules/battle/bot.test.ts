import { describe, it, expect } from 'vitest';
import { generateBotProfile, botChooseAction, getBotResponseDelay } from './bot.service';
import { Action, ItemTrait } from '@lootflip/shared';

describe('bot.service', () => {
  describe('generateBotProfile', () => {
    it('should generate a bot with valid equipment', () => {
      const bot = generateBotProfile(1000);
      expect(bot.username).toBeTruthy();
      expect(bot.elo).toBeGreaterThanOrEqual(0);
      expect(bot.equipment).toHaveLength(3);
      expect(bot.equipment.map(e => e.type)).toEqual(['WEAPON', 'ARMOR', 'SPELL']);
    });
  });

  describe('botChooseAction', () => {
    it('should return a valid action', () => {
      const result = botChooseAction(
        null,
        [false, false, false],
        [
          { type: 'WEAPON', trait: 'BURN', rarity: 'COMMON', bonusDamage: 1 },
          { type: 'ARMOR', trait: 'FREEZE', rarity: 'COMMON', bonusDamage: 1 },
          { type: 'SPELL', trait: 'LIGHTNING', rarity: 'COMMON', bonusDamage: 1 },
        ],
        100
      );
      expect(Object.values(Action)).toContain(result.action);
    });

    it('should not use already used powers', () => {
      const results = Array.from({ length: 50 }, () =>
        botChooseAction(
          null,
          [true, true, true],
          [
            { type: 'WEAPON', trait: 'BURN', rarity: 'COMMON', bonusDamage: 1 },
            { type: 'ARMOR', trait: 'FREEZE', rarity: 'COMMON', bonusDamage: 1 },
            { type: 'SPELL', trait: 'LIGHTNING', rarity: 'COMMON', bonusDamage: 1 },
          ],
          100
        )
      );
      expect(results.every(r => r.powerIndex === null)).toBe(true);
    });
  });

  describe('getBotResponseDelay', () => {
    it('should return delay between 1s and 3s', () => {
      const delay = getBotResponseDelay();
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(3000);
    });
  });
});
