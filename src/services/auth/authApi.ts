import AsyncStorage from '@react-native-async-storage/async-storage';

type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
};

type PublicUser = Omit<StoredUser, 'passwordHash'>;

const USERS_KEY = 'db:users';

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

export const authApi = {
  async register(params: {
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
    if (password.length < 6) {
      throw new Error('密码至少 6 位');
    }
    if (displayName.length < 2) {
      throw new Error('昵称至少 2 个字符');
    }

    const users = await getUsers();
    const exists = users.some((u) => u.email === email);
    if (exists) {
      throw new Error('该邮箱已注册');
    }

    const newUser: StoredUser = {
      id: randomId('user'),
      email,
      displayName,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await setUsers([...users, newUser]);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt,
      },
      accessToken: randomId('token'),
    };
  },

  async login(params: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; accessToken: string }> {
    const email = params.email.trim().toLowerCase();
    const password = params.password;

    if (!email || !password) {
      throw new Error('请输入邮箱和密码');
    }

    const users = await getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('用户不存在');
    }

    const ok = user.passwordHash === hashPassword(password);
    if (!ok) {
      throw new Error('密码错误');
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
