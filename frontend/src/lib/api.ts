const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let authToken: string | null = null;

export function setToken(token: string) {
  authToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function getToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('token');
  }
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data;
}

export const api = {
  auth: (initData: string) =>
    request<{ token: string; user: any; isNewUser: boolean }>('/api/auth', {
      method: 'POST', body: JSON.stringify({ initData }),
    }),
  devAuth: (username: string) =>
    request<{ token: string; user: any; isNewUser: boolean }>('/api/auth/dev', {
      method: 'POST', body: JSON.stringify({ username }),
    }),
  getUser: () => request<any>('/api/user'),
  openChest: (isPremium = false) =>
    request<any>('/api/chest/open', {
      method: 'POST', body: JSON.stringify({ isPremium }),
    }),
  getInventory: () => request<any[]>('/api/inventory'),
  equip: (itemId: string) =>
    request<any>('/api/inventory/equip', {
      method: 'POST', body: JSON.stringify({ itemId }),
    }),
  unequip: (itemId: string) =>
    request<any>('/api/inventory/unequip', {
      method: 'POST', body: JSON.stringify({ itemId }),
    }),
  getLeaderboard: (league?: string) =>
    request<any[]>(`/api/user/leaderboard${league ? `?league=${league}` : ''}`),
  getBattleHistory: () => request<any[]>('/api/battle/history'),
  getSeasonInfo: () => request<any>('/api/season/current'),
  getSeasonRewards: () => request<any[]>('/api/season/rewards'),
  claimRewards: () => request<any>('/api/season/claim', { method: 'POST' }),

  // Phase 3 — Marketplace
  createListing: (itemId: string, price: number, currency: string) =>
    request<any>('/api/market/list', {
      method: 'POST', body: JSON.stringify({ itemId, price, currency }),
    }),
  searchListings: (params: Record<string, string | number | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return request<any>(`/api/market/listings${query ? `?${query}` : ''}`);
  },
  getListing: (id: string) => request<any>(`/api/market/listings/${id}`),
  buyListing: (id: string) =>
    request<any>(`/api/market/buy/${id}`, { method: 'POST' }),
  makeOffer: (listingId: string, offerPrice: number) =>
    request<any>(`/api/market/offer/${listingId}`, {
      method: 'POST', body: JSON.stringify({ offerPrice }),
    }),
  respondToOffer: (offerId: string, accept: boolean) =>
    request<any>(`/api/market/offer/${offerId}/respond`, {
      method: 'POST', body: JSON.stringify({ accept }),
    }),
  cancelListing: (id: string) =>
    request<any>(`/api/market/listings/${id}`, { method: 'DELETE' }),
  getMyListings: () => request<any[]>('/api/market/my-listings'),
  getMyOffers: () => request<any[]>('/api/market/my-offers'),

  // Phase 3 — Shop
  getShopItems: () => request<any[]>('/api/shop/items'),
  buyShopItem: (id: string) =>
    request<any>(`/api/shop/buy/${id}`, { method: 'POST' }),
  getPriceHistory: (id: string) =>
    request<any[]>(`/api/shop/prices/history/${id}`),

  // Phase 3 — Craft
  getCraftRecipes: () => request<any[]>('/api/craft/recipes'),
  upgradeItem: (itemId: string, materialIds: string[]) =>
    request<any>('/api/craft/upgrade', {
      method: 'POST', body: JSON.stringify({ itemId, materialIds }),
    }),

  // Phase 3 — Cosmetics
  getCosmetics: () => request<any[]>('/api/inventory/cosmetics'),
  equipCosmetic: (cosmeticId: string) =>
    request<any>('/api/inventory/cosmetics/equip', {
      method: 'POST', body: JSON.stringify({ cosmeticId }),
    }),
  unequipCosmetic: (cosmeticId: string) =>
    request<any>('/api/inventory/cosmetics/unequip', {
      method: 'POST', body: JSON.stringify({ cosmeticId }),
    }),

  // Phase 4 — Guild
  createGuild: (name: string, description: string) =>
    request<any>('/api/guild/create', { method: 'POST', body: JSON.stringify({ name, description }) }),
  getMyGuild: () => request<any>('/api/guild/my'),
  getGuild: (id: string) => request<any>(`/api/guild/${id}`),
  searchGuilds: (q: string) => request<any[]>(`/api/guild/search?q=${encodeURIComponent(q)}`),
  getGuildLeaderboard: () => request<any[]>('/api/guild/leaderboard'),
  joinGuild: (id: string) => request<any>(`/api/guild/${id}/join`, { method: 'POST' }),
  leaveGuild: (id: string) => request<any>(`/api/guild/${id}/leave`, { method: 'POST' }),
  kickMember: (guildId: string, targetUserId: string) =>
    request<any>(`/api/guild/${guildId}/kick`, { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  promoteMember: (guildId: string, targetUserId: string) =>
    request<any>(`/api/guild/${guildId}/promote`, { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  demoteMember: (guildId: string, targetUserId: string) =>
    request<any>(`/api/guild/${guildId}/demote`, { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  donate: (guildId: string, goldAmount: number, gemAmount: number, itemId?: string) =>
    request<any>(`/api/guild/${guildId}/donate`, { method: 'POST', body: JSON.stringify({ goldAmount, gemAmount, itemId }) }),
  postAnnouncement: (guildId: string, content: string, isPinned: boolean) =>
    request<any>(`/api/guild/${guildId}/announce`, { method: 'POST', body: JSON.stringify({ content, isPinned }) }),
  declareWar: (guildId: string, defenderGuildId: string) =>
    request<any>('/api/tournament/war/declare', { method: 'POST', body: JSON.stringify({ guildId, defenderGuildId }) }),
  respondToWar: (warId: string, accept: boolean) =>
    request<any>(`/api/tournament/war/${warId}/respond`, { method: 'POST', body: JSON.stringify({ accept }) }),
  getWar: (warId: string) => request<any>(`/api/tournament/war/${warId}`),
  getCurrentTournament: () => request<any>('/api/tournament/current'),
  registerForTournament: (guildId: string) =>
    request<any>('/api/tournament/register', { method: 'POST', body: JSON.stringify({ guildId }) }),

  // Phase 4 — Friends
  getFriends: () => request<any[]>('/api/friends'),
  getFriendRequests: () => request<any[]>('/api/friends/requests'),
  sendFriendRequest: (userId: string) =>
    request<any>('/api/friends/request', { method: 'POST', body: JSON.stringify({ userId }) }),
  respondToFriendRequest: (friendshipId: string, accept: boolean) =>
    request<any>('/api/friends/respond', { method: 'POST', body: JSON.stringify({ friendshipId, accept }) }),
  removeFriend: (id: string) => request<any>(`/api/friends/${id}`, { method: 'DELETE' }),
  getRecentOpponents: () => request<any[]>('/api/friends/recent'),

  // Phase 4 — Challenges
  sendChallenge: (friendId: string, goldStake: number) =>
    request<any>('/api/challenge/send', { method: 'POST', body: JSON.stringify({ friendId, goldStake }) }),
  respondToChallenge: (id: string, accept: boolean) =>
    request<any>(`/api/challenge/${id}/respond`, { method: 'POST', body: JSON.stringify({ accept }) }),
  getPendingChallenges: () => request<any[]>('/api/challenge/pending'),

  // Phase 5 — Wallet
  createWallet: () => request<any>('/api/wallet/create', { method: 'POST' }),
  connectWallet: (address: string) =>
    request<any>('/api/wallet/connect', { method: 'POST', body: JSON.stringify({ address }) }),
  getWalletInfo: () => request<any>('/api/wallet/info'),
  disconnectWallet: () => request<any>('/api/wallet/disconnect', { method: 'POST' }),

  // Phase 5 — Token
  withdrawGem: (amount: number) =>
    request<any>('/api/token/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }),
  confirmDeposit: (amount: number, txHash: string) =>
    request<any>('/api/token/deposit/confirm', { method: 'POST', body: JSON.stringify({ amount, txHash }) }),
  getTokenTransactions: () => request<any[]>('/api/token/transactions'),
  getTokenStats: () => request<any>('/api/token/stats'),

  // Phase 5 — Staking
  stakeGem: (amount: number, lockDays: number) =>
    request<any>('/api/staking/stake', { method: 'POST', body: JSON.stringify({ amount, lockDays }) }),
  unstakeGem: (id: string) => request<any>(`/api/staking/unstake/${id}`, { method: 'POST' }),
  claimStakeRewards: (id: string) => request<any>(`/api/staking/claim/${id}`, { method: 'POST' }),
  getStakePositions: () => request<any[]>('/api/staking/positions'),
  getStakingInfo: () => request<any>('/api/staking/info'),

  // Phase 5 — Governance
  createProposal: (title: string, description: string, category: string, options: string[]) =>
    request<any>('/api/governance/propose', { method: 'POST', body: JSON.stringify({ title, description, category, options }) }),
  voteOnProposal: (id: string, optionIndex: number) =>
    request<any>(`/api/governance/vote/${id}`, { method: 'POST', body: JSON.stringify({ optionIndex }) }),
  getProposals: (status?: string) =>
    request<any[]>(`/api/governance/proposals${status ? `?status=${status}` : ''}`),
  getProposal: (id: string) => request<any>(`/api/governance/proposals/${id}`),

  // Phase 6 — Raid
  getRaidBosses: () => request<any[]>('/api/raid/bosses'),
  startRaid: (guildId: string, bossId: string, difficulty: string) =>
    request<any>('/api/raid/start', { method: 'POST', body: JSON.stringify({ guildId, bossId, difficulty }) }),
  getActiveRaid: (guildId: string) => request<any>(`/api/raid/active?guildId=${guildId}`),
  getRaid: (id: string) => request<any>(`/api/raid/${id}`),
  attemptRaid: (raidId: string) =>
    request<any>('/api/raid/attempt', { method: 'POST', body: JSON.stringify({ raidId }) }),
  claimRaidReward: (raidId: string) =>
    request<any>(`/api/raid/${raidId}/claim`, { method: 'POST' }),

  // Phase 6 — Prestige
  getPrestigeInfo: () => request<any>('/api/prestige/info'),
  activatePrestige: () => request<any>('/api/prestige/reset', { method: 'POST' }),

  // Phase 6 — Events
  getActiveEvents: () => request<any[]>('/api/events/active'),
  getEventHistory: () => request<any[]>('/api/events/history'),
  getEvent: (id: string) => request<any>(`/api/events/${id}`),
  participateEvent: (id: string) => request<any>(`/api/events/${id}/participate`, { method: 'POST' }),
  claimEventReward: (id: string) => request<any>(`/api/events/${id}/claim`, { method: 'POST' }),

  // Phase 7 — Quests
  getDailyQuests: () => request<any[]>('/api/quests'),
  claimQuestReward: (questId: string) =>
    request<any>(`/api/quests/claim/${questId}`, { method: 'POST' }),

  // Phase 7 — Referral
  getReferralInfo: () => request<any>('/api/referral/info'),
  claimAirdrop: () => request<any>('/api/referral/airdrop', { method: 'POST' }),

  // Phase 7 — Analytics
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) =>
    request<any>('/api/analytics/track', { method: 'POST', body: JSON.stringify({ eventType, metadata }) }),
  getAnalyticsStats: () => request<any>('/api/analytics/stats'),
};
