import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authApi } from '../../services/auth/authApi';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signInWithFido: (params: { email: string }) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    displayName: string;
  }) => Promise<void>;
  enableFido: (params: { email: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_USER_KEY = 'auth:user';
const AUTH_TOKEN_KEY = 'auth:access_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRaw, tokenRaw] = await Promise.all([
          AsyncStorage.getItem(AUTH_USER_KEY),
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
        ]);

        if (userRaw && tokenRaw) {
          const parsed = JSON.parse(userRaw) as AuthUser;
          setUser(parsed);
          setAccessToken(tokenRaw);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const signIn = useCallback(
    async (params: { email: string; password: string }) => {
      const result = await authApi.login(params);
      setUser(result.user);
      setAccessToken(result.accessToken);
      await Promise.all([
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user)),
        AsyncStorage.setItem(AUTH_TOKEN_KEY, result.accessToken),
      ]);
    },
    [],
  );

  const signInWithFido = useCallback(async (params: { email: string }) => {
    const result = await authApi.loginWithFido(params);
    setUser(result.user);
    setAccessToken(result.accessToken);
    await Promise.all([
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user)),
      AsyncStorage.setItem(AUTH_TOKEN_KEY, result.accessToken),
    ]);
  }, []);

  const register = useCallback(
    async (params: { email: string; password: string; displayName: string }) => {
      const result = await authApi.register(params);
      setUser(result.user);
      setAccessToken(result.accessToken);
      await Promise.all([
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user)),
        AsyncStorage.setItem(AUTH_TOKEN_KEY, result.accessToken),
      ]);
    },
    [],
  );

  const enableFido = useCallback(async (params: { email: string }) => {
    await authApi.enableFido(params);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    await Promise.all([
      AsyncStorage.removeItem(AUTH_USER_KEY),
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    ]);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, isLoading, signIn, signInWithFido, register, enableFido, signOut }),
    [user, accessToken, isLoading, signIn, signInWithFido, register, enableFido, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
