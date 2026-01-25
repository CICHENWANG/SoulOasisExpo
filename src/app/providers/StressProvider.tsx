import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from './AuthProvider';

type StressContextValue = {
  stress01: number;
  stressScore: number;
  setStress01: (v: number) => Promise<void>;
  isReady: boolean;
};

const StressContext = createContext<StressContextValue | undefined>(undefined);

function storageKey(userId?: string | null) {
  return `stress:value:${userId ?? 'guest'}`;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function StressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [stress01, setStress01State] = useState(0.08);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsReady(false);
      try {
        const key = storageKey(user?.id);
        const rawUser = await AsyncStorage.getItem(key);
        const rawGuest = rawUser ?? (await AsyncStorage.getItem(storageKey('guest')));
        const n = rawGuest == null ? NaN : Number(rawGuest);
        if (Number.isFinite(n)) {
          const next = clamp01(n);
          setStress01State(next);
          if (rawUser == null && user?.id) {
            await AsyncStorage.setItem(key, String(next));
          }
          return;
        }
        setStress01State(0.08);
      } finally {
        setIsReady(true);
      }
    };

    void load();
  }, [user?.id]);

  const setStress01 = async (v: number) => {
    const next = clamp01(v);
    setStress01State(next);
    await AsyncStorage.setItem(storageKey(user?.id), String(next));
  };

  const stressScore = useMemo(() => Math.round(stress01 * 10), [stress01]);

  const value = useMemo<StressContextValue>(
    () => ({ stress01, stressScore, setStress01, isReady }),
    [stress01, stressScore, isReady],
  );

  return <StressContext.Provider value={value}>{children}</StressContext.Provider>;
}

export function useStress() {
  const ctx = useContext(StressContext);
  if (!ctx) {
    throw new Error('useStress must be used within StressProvider');
  }
  return ctx;
}
