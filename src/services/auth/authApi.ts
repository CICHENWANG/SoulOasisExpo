import AsyncStorage from '@react-native-async-storage/async-storage';

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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8080';

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
    throw new Error(`无法连接后端：${url}（${msg}）`);
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`后端返回非 JSON：${text}`);
  }

  if (!res.ok) {
    throw new Error(`请求失败：HTTP ${res.status}`);
  }

  const payload = json as Partial<BackendResult<T>>;
  const code = typeof payload.code === 'number' ? payload.code : 200;
  if (code !== 200) {
    const msg = payload.message ?? payload.msg ?? '请求失败';
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
    throw new Error('请输入有效邮箱');
  }
  if (!password) {
    throw new Error('请输入密码');
  }
  if (!displayName) {
    throw new Error('请输入昵称');
  }

  const users = await getUsers();
  const exists = users.some((u) => u.email === email);
  if (exists) {
    throw new Error('该邮箱已注册');
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
    throw new Error('请输入邮箱和密码');
  }

  const users = await getUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    if (existing.passwordHash !== hashPassword(password)) {
      throw new Error('密码错误');
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
      throw new Error('请输入有效邮箱');
    }
    if (!password) {
      throw new Error('请输入密码');
    }
    if (!displayName) {
      throw new Error('请输入昵称');
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
      throw new Error('请输入邮箱和密码');
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
      throw new Error('请输入有效邮箱');
    }

    const users = await getUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx < 0) {
      throw new Error('用户不存在');
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
      throw new Error('请输入有效邮箱');
    }

    const users = await getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('用户不存在');
    }
    if (!user.fidoEnabled) {
      throw new Error('该账号尚未启用 Passkey');
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
};
