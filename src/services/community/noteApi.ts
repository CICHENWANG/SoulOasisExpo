import { resolveApiBaseUrl } from '../apiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

function ensureEnglishOrFallback(input: string | null | undefined, fallback: string) {
  const cleaned = stripCjk(String(input ?? '')).trim();
  return cleaned ? cleaned : fallback;
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

export type NoteListItem = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  likeCount: number;
  commentCount: number;
  createTime: string;
};

export type NoteList = {
  page: number;
  pageSize: number;
  hasMore: boolean;
  items: NoteListItem[];
};

export type NoteDetail = {
  id: string;
  userId: string;
  title: string;
  contentMarkdown: string;
  contentHtml: string;
  author: string;
  coverUrl?: string | null;
  likeCount: number;
  commentCount: number;
  createTime: string;
};

export type NoteComment = {
  id: string;
  noteId: string;
  userId: string;
  author: string;
  content: string;
  createTime: string;
};

export const noteApi = {
  listNotes(params: {
    token: string;
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) {
    const p = params.page ?? 1;
    const ps = params.pageSize ?? 20;
    const keyword = stripCjk((params.keyword ?? '').trim());

    const qs = new URLSearchParams();
    qs.set('page', String(p));
    qs.set('pageSize', String(ps));
    if (keyword) qs.set('keyword', keyword);

    return httpJson<NoteList>(`/note/listNotes?${qs.toString()}`, {
      method: 'GET',
      token: params.token,
    }).then((data) => ({
      ...data,
      items: (data.items ?? []).map((item) => ({
        ...item,
        title: ensureEnglishOrFallback(item.title, 'Untitled'),
        author: ensureEnglishOrFallback(item.author, 'User'),
      })),
    }));
  },

  getNoteDetail(params: { token: string; noteId: string }) {
    const qs = new URLSearchParams();
    qs.set('noteId', params.noteId);

    return httpJson<NoteDetail>(`/note/getNoteDetail?${qs.toString()}`, {
      method: 'GET',
      token: params.token,
    }).then((detail) => ({
      ...detail,
      title: ensureEnglishOrFallback(detail.title, 'Untitled'),
      author: ensureEnglishOrFallback(detail.author, 'User'),
      contentMarkdown: ensureEnglishOrFallback(detail.contentMarkdown, 'Content unavailable.'),
      contentHtml: ensureEnglishOrFallback(detail.contentHtml, 'Content unavailable.'),
    }));
  },

  listComments(params: {
    token: string;
    noteId: string;
    page?: number;
    pageSize?: number;
  }) {
    const p = params.page ?? 1;
    const ps = params.pageSize ?? 20;

    const qs = new URLSearchParams();
    qs.set('noteId', params.noteId);
    qs.set('page', String(p));
    qs.set('pageSize', String(ps));

    return httpJson<NoteComment[]>(`/note/listComments?${qs.toString()}`, {
      method: 'GET',
      token: params.token,
    }).then((list) =>
      (list ?? []).map((c) => ({
        ...c,
        author: ensureEnglishOrFallback(c.author, 'User'),
        content: ensureEnglishOrFallback(c.content, '...'),
      })),
    );
  },

  postNoteText(params: {
    token: string;
    title: string;
    contentText: string;
    coverUrl?: string;
  }) {
    const body: { title: string; contentText: string; coverUrl?: string } = {
      title: stripCjk(params.title),
      contentText: stripCjk(params.contentText),
    };
    const cover = (params.coverUrl ?? '').trim();
    if (cover) body.coverUrl = cover;

    return httpJson<string>('/note/postNoteText', {
      method: 'POST',
      token: params.token,
      body,
    });
  },

  postComment(params: { token: string; noteId: string; content: string }) {
    return httpJson<string>('/note/postComment', {
      method: 'POST',
      token: params.token,
      body: {
        noteId: params.noteId,
        content: stripCjk(params.content),
      },
    });
  },
};
