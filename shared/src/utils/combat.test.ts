import { describe, it, expect } from 'vitest';
import { resolveRound, determineWinner, generateShadowReveal } from './combat';
import { Action } from '../types/battle';
import { ItemTrait } from '../types/item';
import { GAME } from '../constants/game';

const emptyCtx = {
  p1Equipment: [],
  p2Equipment: [],
  p1PowersUsed: [false, false, false],
  p2PowersUsed: [false, false, false],
};

describe('combat resolution', () => {
  describe('resolveRound', () => {
    it('ATTACK beats SPELL', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: null },
        { action: Action.SPELL, powerIndex: null },
        emptyCtx
      );
      expect(result.p2Damage).toBe(GAME.BASE_DAMAGE);
      expect(result.p1Damage).toBe(0);
    });

    it('DEFEND beats ATTACK', () => {
      const result = resolveRound(
        { action: Action.DEFEND, powerIndex: null },
        { action: Action.ATTACK, powerIndex: null },
        emptyCtx
      );
      expect(result.p2Damage).toBe(GAME.BASE_DAMAGE);
      expect(result.p1Damage).toBe(0);
    });

    it('SPELL beats DEFEND', () => {
      const result = resolveRound(
        { action: Action.SPELL, powerIndex: null },
        { action: Action.DEFEND, powerIndex: null },
        emptyCtx
      );
      expect(result.p2Damage).toBe(GAME.BASE_DAMAGE);
      expect(result.p1Damage).toBe(0);
    });

    it('same action = draw, no damage', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: null },
        { action: Action.ATTACK, powerIndex: null },
        emptyCtx
      );
      expect(result.p1Damage).toBe(0);
      expect(result.p2Damage).toBe(0);
    });

    it('BURN doubles damage on win', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: 0 },
        { action: Action.SPELL, powerIndex: null },
        {
          p1Equipment: [{ type: 'WEAPON', trait: 'BURN', rarity: 'COMMON', bonusDamage: 1 }],
          p2Equipment: [],
          p1PowersUsed: [false, false, false],
          p2PowersUsed: [false, false, false],
        }
      );
      expect(result.p2Damage).toBe((GAME.BASE_DAMAGE + 1) * 2);
    });

    it('FREEZE cancels damage on loss', () => {
      const result = resolveRound(
        { action: Action.SPELL, powerIndex: 0 },
        { action: Action.ATTACK, powerIndex: null },
        {
          p1Equipment: [{ type: 'WEAPON', trait: 'FREEZE', rarity: 'COMMON', bonusDamage: 1 }],
          p2Equipment: [],
          p1PowersUsed: [false, false, false],
          p2PowersUsed: [false, false, false],
        }
      );
      expect(result.p1Damage).toBe(0);
    });

    it('POISON deals damage on draw', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: 0 },
        { action: Action.ATTACK, powerIndex: null },
        {
          p1Equipment: [{ type: 'WEAPON', trait: 'POISON', rarity: 'COMMON', bonusDamage: 1 }],
          p2Equipment: [],
          p1PowersUsed: [false, false, false],
          p2PowersUsed: [false, false, false],
        }
      );
      expect(result.p2Damage).toBe(GAME.POISON_DAMAGE);
    });

    it('HEAL restores HP', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: 0 },
        { action: Action.SPELL, powerIndex: null },
        {
          p1Equipment: [{ type: 'WEAPON', trait: 'HEAL', rarity: 'COMMON', bonusDamage: 1 }],
          p2Equipment: [],
          p1PowersUsed: [false, false, false],
          p2PowersUsed: [false, false, false],
        }
      );
      expect(result.p1Heal).toBe(GAME.HEAL_AMOUNT);
    });

    it('LIGHTNING doubles the round stakes', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: 0 },
        { action: Action.SPELL, powerIndex: null },
        {
          p1Equipment: [{ type: 'WEAPON', trait: 'LIGHTNING', rarity: 'COMMON', bonusDamage: 1 }],
          p2Equipment: [],
          p1PowersUsed: [false, false, false],
          p2PowersUsed: [false, false, false],
        }
      );
      expect(result.p2Damage).toBe((GAME.BASE_DAMAGE + 1) * 2);
    });

    it('should not activate already used power', () => {
      const result = resolveRound(
        { action: Action.ATTACK, powerIndex: 0 },
        { action: Action.SPELL, powerIndex: null },
        {
          p1Equipment: [{ type: 'WEAPON', trait: 'BURN', rarity: 'COMMON', bonusDamage: 1 }],
          p2Equipment: [],
          p1PowersUsed: [true, false, false],
          p2PowersUsed: [false, false, false],
        }
      );
      expect(result.p2Damage).toBe(GAME.BASE_DAMAGE + 1); // No doubling
      expect(result.p1PowerActivated).toBeNull();
    });
  });

  describe('determineWinner', () => {
    it('player with more HP wins', () => {
      expect(determineWinner(80, 60)).toBe('p1');
    });

    it('draw if same HP', () => {
      expect(determineWinner(60, 60)).toBe('draw');
    });

    it('player at 0 HP loses', () => {
      expect(determineWinner(0, 40)).toBe('p2');
    });
  });

  describe('generateShadowReveal', () => {
    it('should return 2 actions including the real one', () => {
      const revealed = generateShadowReveal(Action.ATTACK);
      expect(revealed).toHaveLength(2);
      expect(revealed).toContain(Action.ATTACK);
    });
  });
});
