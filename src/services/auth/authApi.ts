import AsyncStorage from '@react-native-async-storage/async-storage';

import { resolveApiBaseUrl } from '../apiBaseUrl';

type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  fidoEnabled?: boolean;
  fidoCredentialId?: string;
};

type PublicUser = Omit<StoredUser, 'passwordHash'>;

const USERS_KEY = 'db:users';

const MOCK_RESET_EXPIRE_MILLIS = 10 * 60 * 1000;
const mockResetCodes: Record<string, { code: string; expireAt: number }> = {};

const API_BASE_URL = resolveApiBaseUrl();

type AuthMode = 'auto' | 'backend' | 'mock';

function getAuthMode(): AuthMode {
  const raw = (process.env.EXPO_PUBLIC_AUTH_MODE ?? 'auto').toLowerCase();
  if (raw === 'backend') return 'backend';
  if (raw === 'mock' || raw === 'local') return 'mock';
  return 'auto';
}

type BackendResult<T> = {
  code: number;
  message?: string;
  msg?: string;
  data: T;
};

async function httpJson<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    token?: string;
  },
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers.satoken = options.token;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: options?.method ?? 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Unable to reach backend: ${url} (${msg})`);
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Backend returned non-JSON: ${text}`);
  }

  if (!res.ok) {
    throw new Error(`Request failed: status ${res.status}`);
  }

  const payload = json as Partial<BackendResult<T>>;
  const code = typeof payload.code === 'number' ? payload.code : 200;
  if (code !== 200) {
    const msg = payload.message ?? payload.msg ?? 'Request failed';
    throw new Error(msg);
  }

  return payload.data as T;
}

function randomId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function hashPassword(password: string) {
  const salt = 'soul_oasis';
  let acc = 0;
  for (let i = 0; i < password.length; i += 1) {
    acc = (acc + password.charCodeAt(i) * (i + 1)) % 1000000;
  }
  for (let i = 0; i < salt.length; i += 1) {
    acc = (acc + salt.charCodeAt(i) * (i + 7)) % 1000000;
  }
  return `${acc.toString(16)}.${password.length}`;
}

function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('Please enter a valid email.');
  }
}

function validateNewPassword(password: string) {
  if (!password) {
    throw new Error('Please enter a new password.');
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d).{6,50}$/.test(password)) {
    throw new Error('Invalid password (must include letters and numbers, length 6-50).');
  }
}

async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

async function setUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser(user: StoredUser): PublicUser {
  const { passwordHash: _pw, ...rest } = user;
  return rest;
}

async function mockRegister(params: {
  email: string;
  password: string;
  displayName: string;
}): Promise<{ user: PublicUser; accessToken: string }> {
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const displayName = params.displayName.trim();

  if (!email.includes('@')) {
    throw new Error('Please enter a valid email.');
  }
  if (!password) {
    throw new Error('Please enter a password.');
  }
  if (!displayName) {
    throw new Error('Please enter a name.');
  }

  const users = await getUsers();
  const exists = users.some((u) => u.email === email);
  if (exists) {
    throw new Error('This email is already registered.');
  }

  const createdAt = new Date().toISOString();
  const stored: StoredUser = {
    id: randomId('user'),
    email,
    displayName,
    passwordHash: hashPassword(password),
    createdAt,
  };

  await setUsers([...users, stored]);

  return {
    user: toPublicUser(stored),
    accessToken: randomId('mock_token'),
  };
}

async function mockLogin(params: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser; accessToken: string }> {
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  if (!email || !password) {
    throw new Error('Please enter email and password.');
  }

  const users = await getUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    if (existing.passwordHash !== hashPassword(password)) {
      throw new Error('Incorrect password.');
    }
    return {
      user: toPublicUser(existing),
      accessToken: randomId('mock_token'),
    };
  }

  const createdAt = new Date().toISOString();
  const stored: StoredUser = {
    id: randomId('user'),
    email,
    displayName: email.split('@')[0] || email,
    passwordHash: hashPassword(password),
    createdAt,
  };

  await setUsers([...users, stored]);

  return {
    user: toPublicUser(stored),
    accessToken: randomId('mock_token'),
  };
}

export const authApi = {
  async register(params: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<{ user: PublicUser; accessToken: string }> {
    const mode = getAuthMode();
    if (mode === 'mock') {
      return mockRegister(params);
    }

    const email = params.email.trim().toLowerCase();
    const password = params.password;
    const displayName = params.displayName.trim();

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email.');
    }
    if (!password) {
      throw new Error('Please enter a password.');
    }
    if (!displayName) {
      throw new Error('Please enter a name.');
    }

    try {
      await httpJson<string>('/user/register', {
        method: 'POST',
        body: {
          email,
          password,
          displayName,
        },
      });

      const loginData = await httpJson<{ userId: number; token: string }>('/user/doLogin', {
        method: 'POST',
        body: { email, password },
      });

      const myInfo = await httpJson<{
        userId: number;
        username: string;
        email: string;
        createTime?: string;
        create_time?: string;
      }>('/user/getMyInfo', {
        method: 'GET',
        token: loginData.token,
      });

      const createdAt =
        (myInfo.createTime ?? myInfo.create_time ?? new Date().toISOString()).toString();

      return {
        user: {
          id: String(myInfo.userId ?? loginData.userId),
          email: myInfo.email ?? email,
          displayName: myInfo.username ?? displayName,
          createdAt,
        },
        accessToken: loginData.token,
      };
    } catch (e) {
      if (mode === 'backend') {
        throw e;
      }
      return mockRegister(params);
    }
  },

  async login(params: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; accessToken: string }> {
    const mode = getAuthMode();
    if (mode === 'mock') {
      return mockLogin(params);
    }

    const email = params.email.trim().toLowerCase();
    const password = params.password;

    if (!email || !password) {
      throw new Error('Please enter email and password.');
    }

    try {
      const loginData = await httpJson<{ userId: number; token: string }>('/user/doLogin', {
        method: 'POST',
        body: { email, password },
      });

      const myInfo = await httpJson<{
        userId: number;
        username: string;
        email: string;
        createTime?: string;
        create_time?: string;
      }>('/user/getMyInfo', {
        method: 'GET',
        token: loginData.token,
      });

      const createdAt =
        (myInfo.createTime ?? myInfo.create_time ?? new Date().toISOString()).toString();

      return {
        user: {
          id: String(myInfo.userId ?? loginData.userId),
          email: myInfo.email ?? email,
          displayName: myInfo.username ?? email,
          createdAt,
        },
        accessToken: loginData.token,
      };
    } catch (e) {
      if (mode === 'backend') {
        throw e;
      }
      return mockLogin(params);
    }
  },

  async enableFido(params: { email: string }): Promise<{ credentialId: string }> {
    const email = params.email.trim().toLowerCase();
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email.');
    }

    const users = await getUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx < 0) {
      throw new Error('User not found.');
    }

    const old = users[idx];
    const credentialId = old.fidoCredentialId ?? randomId('fido');
    const next: StoredUser = {
      ...old,
      fidoEnabled: true,
      fidoCredentialId: credentialId,
    };

    const cloned = [...users];
    cloned[idx] = next;
    await setUsers(cloned);

    return { credentialId };
  },

  async loginWithFido(params: { email: string }): Promise<{ user: PublicUser; accessToken: string }> {
    const email = params.email.trim().toLowerCase();
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email.');
    }

    const users = await getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('User not found.');
    }
    if (!user.fidoEnabled) {
      throw new Error('Passkey is not enabled for this account.');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      accessToken: randomId('token'),
    };
  },

  async requestPasswordReset(params: {
    email: string;
  }): Promise<{ code: string; expireSeconds: number }> {
    const mode = getAuthMode();
    const email = params.email.trim().toLowerCase();
    validateEmail(email);

    if (mode !== 'mock') {
      try {
        return await httpJson<{ code: string; expireSeconds: number }>(
          '/user/passwordReset/request',
          {
            method: 'POST',
            body: { email },
          },
        );
      } catch (e) {
        if (mode === 'backend') {
          throw e;
        }
      }
    }

    const users = await getUsers();
    const exists = users.some((u) => u.email === email);
    if (!exists) {
      throw new Error('User not found.');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    mockResetCodes[email] = { code, expireAt: Date.now() + MOCK_RESET_EXPIRE_MILLIS };
    return { code, expireSeconds: Math.floor(MOCK_RESET_EXPIRE_MILLIS / 1000) };
  },

  async confirmPasswordReset(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<void> {
    const mode = getAuthMode();
    const email = params.email.trim().toLowerCase();
    const code = params.code.trim();
    const newPassword = params.newPassword;
    validateEmail(email);
    if (!code) {
      throw new Error('Please enter the code.');
    }
    validateNewPassword(newPassword);

    if (mode !== 'mock') {
      try {
        await httpJson<string>('/user/passwordReset/confirm', {
          method: 'POST',
          body: { email, code, newPassword },
        });
        return;
      } catch (e) {
        if (mode === 'backend') {
          throw e;
        }
      }
    }

    const entry = mockResetCodes[email];
    if (!entry) {
      throw new Error('Please request a code first.');
    }
    if (Date.now() > entry.expireAt) {
      delete mockResetCodes[email];
      throw new Error('Code expired.');
    }
    if (entry.code !== code) {
      throw new Error('Invalid code.');
    }

    const users = await getUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx < 0) {
      throw new Error('User not found.');
    }

    const old = users[idx];
    const next: StoredUser = {
      ...old,
      passwordHash: hashPassword(newPassword),
    };
    const cloned = [...users];
    cloned[idx] = next;
    await setUsers(cloned);
    delete mockResetCodes[email];
  },
};
