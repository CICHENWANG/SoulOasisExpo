import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatHistory'>;

type Session = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

function ensureEnglishOrFallback(input: string | undefined | null, fallback: string) {
  const cleaned = stripCjk((input ?? '').toString()).trim();
  return cleaned ? cleaned : fallback;
}

function sessionStorageKey(sessionId: string) {
  return `chat:session:${sessionId}`;
}

const SESSIONS_INDEX_KEY = 'chat:sessions:index';

async function loadSessionsIndex(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.id === 'string')
      .map((x) => ({
        id: String(x.id),
        title: ensureEnglishOrFallback(String(x.title ?? ''), 'Chat'),
        preview: ensureEnglishOrFallback(String(x.preview ?? ''), ''),
        updatedAt: Number(x.updatedAt ?? 0),
      }))
      .filter((x) => x.id);
  } catch {
    return [];
  }
}

function formatUpdatedAt(ts: number) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function ensureSessionSeed(s: Session) {
  try {
    const key = sessionStorageKey(s.id);
    const raw = await AsyncStorage.getItem(key);
    if (raw) return;

    const now = Date.now();
    const safeTitle = ensureEnglishOrFallback(s.title, 'Chat');
    const safePreview = ensureEnglishOrFallback(s.preview, '');
    const seed = [
      {
        id: `m_${now}_a`,
        role: 'assistant',
        text: `Let's continue with "${safeTitle}". Last time you said: ${safePreview}. What do you want to tackle first?`,
      },
      { id: `m_${now}_u`, role: 'user', text: safePreview },
    ];
    await AsyncStorage.setItem(key, JSON.stringify(seed));
  } catch (e) {
  }
}

export function ChatHistoryScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useMemo(
    () =>
      async () => {
        setLoading(true);
        try {
          const list = await loadSessionsIndex();
          setSessions(list);
        } finally {
          setLoading(false);
        }
      },
    [],
  );

  useEffect(() => {
    void refresh();
    const unsub = navigation.addListener('focus', () => {
      void refresh();
    });
    return unsub;
  }, [navigation, refresh]);

  const openSession = (target: Session) => {
    void (async () => {
      await ensureSessionSeed(target);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'ChatHome',
            params: { sessionId: target.id, title: ensureEnglishOrFallback(target.title, 'Chat') },
          },
        ],
      });
    })();
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Chat history</Text>
        <Text style={styles.subtitle}>Your local conversation sessions (tap to open).</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Sessions</Text>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        ) : sessions.length === 0 ? (
          <Text style={styles.muted}>No sessions yet. Start chatting, then come back here.</Text>
        ) : (
          <View style={styles.stack}>
            {sessions.map((s) => (
              <View key={s.id} style={styles.item}>
                <PrimaryButton
                  title={`${ensureEnglishOrFallback(s.title, 'Chat')}${s.updatedAt ? ` · ${formatUpdatedAt(s.updatedAt)}` : ''}`}
                  variant="ghost"
                  onPress={() => openSession(s)}
                />
                {s.preview ? <Text style={styles.preview}>{ensureEnglishOrFallback(s.preview, '')}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  stack: {
    gap: 10,
  },
  loading: {
    paddingVertical: 10,
  },
  item: {
    gap: 6,
  },
  preview: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
    paddingHorizontal: 6,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
});
