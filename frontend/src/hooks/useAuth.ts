'use client';
import { useState, useEffect } from 'react';
import { api, setToken } from '@/lib/api';
import { useTelegram } from './useTelegram';

export function useAuth() {
  const { initData } = useTelegram();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!initData) {
      if (process.env.NODE_ENV === 'development') setLoading(false);
      return;
    }
    api.auth(initData).then(res => {
      setToken(res.token);
      setUser(res.user);
      setIsNewUser(res.isNewUser);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [initData]);

  return { user, loading, isNewUser };
}
