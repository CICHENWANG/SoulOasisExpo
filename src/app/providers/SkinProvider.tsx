import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useAuth } from './AuthProvider';

type SkinId = 'cara_0' | 'cara_1' | 'cara_2';

type SkinOption = {
  id: SkinId;
  label: string;
  source: ImageSourcePropType;
};

const SKINS: SkinOption[] = [
  { id: 'cara_0', label: 'Skin A', source: require('../../../assets/Cara/未命名作品 3.png') },
  { id: 'cara_1', label: 'Skin B', source: require('../../../assets/Cara/未命名作品 4 2.png') },
  { id: 'cara_2', label: 'Skin C', source: require('../../../assets/Cara/未命名作品 5 1.png') },
];

type SkinContextValue = {
  skinId: SkinId;
  skinSource: ImageSourcePropType;
  skins: SkinOption[];
  setSkinId: (id: SkinId) => Promise<void>;
  isReady: boolean;
};

const SkinContext = createContext<SkinContextValue | undefined>(undefined);

function storageKey(userId: string | null | undefined) {
  return `skin:user:${userId ?? 'guest'}`;
}

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [skinId, setSkinIdState] = useState<SkinId>('cara_0');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsReady(false);
      try {
        const userKey = storageKey(user?.id);
        const rawUser = await AsyncStorage.getItem(userKey);
        if (rawUser === 'cara_0' || rawUser === 'cara_1' || rawUser === 'cara_2') {
          setSkinIdState(rawUser);
          return;
        }

        const guestKey = storageKey('guest');
        const rawGuest = await AsyncStorage.getItem(guestKey);
        if (rawGuest === 'cara_0' || rawGuest === 'cara_1' || rawGuest === 'cara_2') {
          setSkinIdState(rawGuest);
          if (user?.id) {
            await AsyncStorage.setItem(userKey, rawGuest);
          }
          return;
        }

        setSkinIdState('cara_0');
      } finally {
        setIsReady(true);
      }
    };

    void load();
  }, [user?.id]);

  const setSkinId = async (next: SkinId) => {
    setSkinIdState(next);
    const key = storageKey(user?.id);
    await AsyncStorage.setItem(key, next);
  };

  const skinSource = useMemo(() => {
    return SKINS.find((s) => s.id === skinId)?.source ?? SKINS[0].source;
  }, [skinId]);

  const value = useMemo<SkinContextValue>(
    () => ({ skinId, skinSource, skins: SKINS, setSkinId, isReady }),
    [skinId, skinSource, isReady],
  );

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin() {
  const ctx = useContext(SkinContext);
  if (!ctx) {
    throw new Error('useSkin must be used within SkinProvider');
  }
  return ctx;
}
