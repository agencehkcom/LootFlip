'use client';
import { useState, useEffect } from 'react';
import { api, setToken, getToken } from '@/lib/api';
import { useTelegram } from './useTelegram';

export function useAuth() {
  const { initData } = useTelegram();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // If already have a token, try to fetch user
    const existingToken = getToken();
    if (existingToken) {
      api.getUser().then(u => {
        setUser(u);
        setLoading(false);
      }).catch(() => {
        // Token expired, clear and retry
        localStorage.removeItem('token');
        tryAuth();
      });
      return;
    }

    tryAuth();

    async function tryAuth() {
      // Telegram auth
      if (initData) {
        try {
          const res = await api.auth(initData);
          setToken(res.token);
          setUser(res.user);
          setIsNewUser(res.isNewUser);
        } catch {}
        setLoading(false);
        return;
      }

      // Dev mode auto-login
      if (process.env.NODE_ENV === 'development') {
        try {
          const res = await api.devAuth('TestPlayer');
          setToken(res.token);
          setUser(res.user);
          setIsNewUser(res.isNewUser);
        } catch {}
      }
      setLoading(false);
    }
  }, [initData]);

  return { user, loading, isNewUser };
}
