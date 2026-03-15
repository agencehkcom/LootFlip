import { Action, EquippedItem, GAME, ItemTrait, Rarity } from '@lootflip/shared';
import { League, getLeagueFromTrophies } from '@lootflip/shared';

const BOT_NAMES = [
  'ShadowBlade', 'IronFist', 'CrystalMage', 'DarkKnight', 'FireStorm',
  'FrostBite', 'ThunderBolt', 'NightShade', 'StormBreaker', 'VoidWalker',
  'DragonSlayer', 'GhostHunter', 'BladeRunner', 'StarDust', 'MoonLight',
];

const LEAGUE_RARITIES: Record<League, Rarity[]> = {
  [League.BRONZE]: [Rarity.COMMON, Rarity.COMMON, Rarity.RARE],
  [League.SILVER]: [Rarity.COMMON, Rarity.RARE, Rarity.RARE],
  [League.GOLD]: [Rarity.RARE, Rarity.RARE, Rarity.EPIC],
  [League.DIAMOND]: [Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY],
  [League.LEGEND]: [Rarity.EPIC, Rarity.LEGENDARY, Rarity.LEGENDARY],
  [League.MYTHIC]: [Rarity.LEGENDARY, Rarity.LEGENDARY, Rarity.MYTHIC],
};

const RARITY_BONUS: Record<Rarity, number> = {
  [Rarity.COMMON]: 1,
  [Rarity.RARE]: 2,
  [Rarity.EPIC]: 4,
  [Rarity.LEGENDARY]: 6,
  [Rarity.MYTHIC]: 8,
};

export function generateBotProfile(playerElo: number) {
  const eloVariation = Math.floor(Math.random() * 100) - 50;
  const botElo = Math.max(0, playerElo + eloVariation);
  const league = getLeagueFromTrophies(botElo);
  const rarities = LEAGUE_RARITIES[league];

  const types = ['WEAPON', 'ARMOR', 'SPELL'] as const;
  const traits = Object.values(ItemTrait);

  const equipment: EquippedItem[] = types.map((type, i) => ({
    type,
    trait: traits[Math.floor(Math.random() * traits.length)],
    rarity: rarities[i],
    bonusDamage: RARITY_BONUS[rarities[i]],
  }));

  return {
    odId: `bot-${Date.now()}`,
    username: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
    elo: botElo,
    equipment,
  };
}

export function botChooseAction(
  previousAction: Action | null,
  powersUsed: boolean[],
  equipment: EquippedItem[],
  botHp: number
): { action: Action; powerIndex: number | null } {
  const actions = Object.values(Action);

  // 40% chance to repeat previous action
  let action: Action;
  if (previousAction && Math.random() < GAME.BOT_REPEAT_CHANCE) {
    action = previousAction;
  } else {
    action = actions[Math.floor(Math.random() * actions.length)];
  }

  // 33% chance to use a power
  let powerIndex: number | null = null;
  if (Math.random() < GAME.BOT_POWER_CHANCE) {
    const availablePowers = powersUsed
      .map((used, idx) => ({ used, idx, trait: equipment[idx]?.trait }))
      .filter(p => !p.used);

    if (availablePowers.length > 0) {
      // Don't use HEAL if HP > 80
      const filtered = availablePowers.filter(
        p => !(p.trait === ItemTrait.HEAL && botHp > 80)
      );
      const candidates = filtered.length > 0 ? filtered : availablePowers;
      powerIndex = candidates[Math.floor(Math.random() * candidates.length)].idx;
    }
  }

  return { action, powerIndex };
}

export function getBotResponseDelay(): number {
  return GAME.BOT_RESPONSE_MIN_MS +
    Math.random() * (GAME.BOT_RESPONSE_MAX_MS - GAME.BOT_RESPONSE_MIN_MS);
}
