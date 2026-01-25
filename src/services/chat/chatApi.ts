import { resolveApiBaseUrl } from '../apiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();

type BackendResult<T> = {
  code: number;
  message?: string;
  msg?: string;
  data: T;
};

export type AiChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export const chatApi = {
  async chat(params: {
    token?: string | null;
    stressScore: number;
    mode: string;
    messages: AiChatMessage[];
  }): Promise<string> {
    const url = `${API_BASE_URL}/ai/chat`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const token = (params.token ?? '').trim();
    if (token) {
      headers.satoken = token;
    }

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          stressScore: params.stressScore,
          mode: params.mode,
          messages: params.messages,
        }),
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

    const payload = json as Partial<BackendResult<string>>;
    const code = typeof payload.code === 'number' ? payload.code : 200;
    if (code !== 200) {
      const msg = payload.message ?? payload.msg ?? 'Request failed';
      throw new Error(msg);
    }

    return (payload.data ?? '').toString();
  },
};
