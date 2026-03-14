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
};
