'use client';
import { useState, useEffect, useRef } from 'react';
import { api, setToken, getToken } from '@/lib/api';
import { useTelegram } from './useTelegram';

export function useAuth() {
  const { initData } = useTelegram();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authAttempted = useRef(false);

  useEffect(() => {
    // Don't re-run if already authenticated
    if (user) return;

    // If already have a valid token, use it
    const existingToken = getToken();
    if (existingToken) {
      api.getUser().then(u => {
        setUser(u);
        setLoading(false);
      }).catch(() => {
        // Token invalid, clear and wait for initData
        localStorage.removeItem('token');
        attemptAuth();
      });
      return;
    }

    attemptAuth();

    async function attemptAuth() {
      // Telegram auth — wait for initData to be available
      if (initData) {
        if (authAttempted.current) return;
        authAttempted.current = true;
        try {
          const res = await api.auth(initData);
          setToken(res.token);
          setUser(res.user);
          setIsNewUser(res.isNewUser);
        } catch (e: any) {
          console.error('Telegram auth failed:', e.message);
          setError(e.message);
        }
        setLoading(false);
        return;
      }

      // Dev mode auto-login (only in development builds)
      if (process.env.NODE_ENV === 'development') {
        try {
          const res = await api.devAuth('TestPlayer');
          setToken(res.token);
          setUser(res.user);
          setIsNewUser(res.isNewUser);
        } catch (e: any) {
          console.error('Dev auth failed:', e.message);
        }
        setLoading(false);
        return;
      }

      // No initData yet and not dev — keep loading (will retry when initData arrives)
      if (!initData) {
        // Give Telegram SDK time to load
        setTimeout(() => setLoading(false), 2000);
      }
    }
  }, [initData, user]);

  return { user, loading, isNewUser, error };
}
