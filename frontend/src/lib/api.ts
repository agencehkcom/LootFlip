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
};
