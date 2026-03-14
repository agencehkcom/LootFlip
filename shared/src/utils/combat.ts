import { Action, ACTION_BEATS, RoundAction, EquippedItem } from '../types/battle';
import { ItemTrait } from '../types/item';
import { GAME } from '../constants/game';

interface RoundContext {
  p1Equipment: EquippedItem[];
  p2Equipment: EquippedItem[];
  p1PowersUsed: boolean[];
  p2PowersUsed: boolean[];
}

export interface RoundOutcome {
  p1Damage: number;
  p2Damage: number;
  p1Heal: number;
  p2Heal: number;
  p1PowerActivated: number | null;
  p2PowerActivated: number | null;
}

function getWinner(p1: Action, p2: Action): 'p1' | 'p2' | 'draw' {
  if (p1 === p2) return 'draw';
  return ACTION_BEATS[p1] === p2 ? 'p1' : 'p2';
}

function resolvePower(
  powerIndex: number | null,
  equipment: EquippedItem[],
  powersUsed: boolean[]
): ItemTrait | null {
  if (powerIndex === null || powerIndex < 0 || powerIndex >= equipment.length) return null;
  if (powersUsed[powerIndex]) return null;
  return equipment[powerIndex].trait as ItemTrait;
}

export function resolveRound(
  p1Action: RoundAction,
  p2Action: RoundAction,
  ctx: RoundContext
): RoundOutcome {
  const result: RoundOutcome = {
    p1Damage: 0, p2Damage: 0,
    p1Heal: 0, p2Heal: 0,
    p1PowerActivated: null, p2PowerActivated: null,
  };

  const winner = getWinner(p1Action.action, p2Action.action);

  const p1BonusDmg = ctx.p1Equipment.reduce((s, e) => s + e.bonusDamage, 0);
  const p2BonusDmg = ctx.p2Equipment.reduce((s, e) => s + e.bonusDamage, 0);

  let p1Deals = winner === 'p1' ? GAME.BASE_DAMAGE + p1BonusDmg : 0;
  let p2Deals = winner === 'p2' ? GAME.BASE_DAMAGE + p2BonusDmg : 0;

  // Resolve p1 power
  const p1Power = resolvePower(p1Action.powerIndex, ctx.p1Equipment, ctx.p1PowersUsed);
  if (p1Power) {
    result.p1PowerActivated = p1Action.powerIndex;
    switch (p1Power) {
      case ItemTrait.BURN:
        if (winner === 'p1') p1Deals *= 2;
        break;
      case ItemTrait.FREEZE:
        if (winner === 'p2') p2Deals = 0;
        break;
      case ItemTrait.LIGHTNING:
        if (winner === 'p1') p1Deals *= 2;
        else if (winner === 'p2') p2Deals *= 2;
        break;
      case ItemTrait.HEAL:
        result.p1Heal = GAME.HEAL_AMOUNT;
        break;
      case ItemTrait.POISON:
        if (winner === 'draw') result.p2Damage += GAME.POISON_DAMAGE;
        break;
      case ItemTrait.SHADOW:
        // Shadow effect is handled before round resolution (reveal phase)
        break;
    }
  }

  // Resolve p2 power
  const p2Power = resolvePower(p2Action.powerIndex, ctx.p2Equipment, ctx.p2PowersUsed);
  if (p2Power) {
    result.p2PowerActivated = p2Action.powerIndex;
    switch (p2Power) {
      case ItemTrait.BURN:
        if (winner === 'p2') p2Deals *= 2;
        break;
      case ItemTrait.FREEZE:
        if (winner === 'p1') p1Deals = 0;
        break;
      case ItemTrait.LIGHTNING:
        if (winner === 'p2') p2Deals *= 2;
        else if (winner === 'p1') p1Deals *= 2;
        break;
      case ItemTrait.HEAL:
        result.p2Heal = GAME.HEAL_AMOUNT;
        break;
      case ItemTrait.POISON:
        if (winner === 'draw') result.p1Damage += GAME.POISON_DAMAGE;
        break;
      case ItemTrait.SHADOW:
        break;
    }
  }

  if (winner === 'p1') result.p2Damage += p1Deals;
  if (winner === 'p2') result.p1Damage += p2Deals;

  return result;
}

export function determineWinner(p1Hp: number, p2Hp: number): 'p1' | 'p2' | 'draw' {
  if (p1Hp > p2Hp) return 'p1';
  if (p2Hp > p1Hp) return 'p2';
  return 'draw';
}

export function generateShadowReveal(realAction: Action): Action[] {
  const allActions = Object.values(Action);
  const others = allActions.filter(a => a !== realAction);
  const randomOther = others[Math.floor(Math.random() * others.length)];
  const revealed = [realAction, randomOther];
  if (Math.random() > 0.5) revealed.reverse();
  return revealed;
}
