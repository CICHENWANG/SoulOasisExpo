import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Quotes'>;

type Quote = {
  id: string;
  text: string;
  source: string;
  tags: string[];
  mood: '舒缓' | '鼓励' | '清醒';
};

const QUOTES: Quote[] = [
  {
    id: 'q1',
    text: '你不是在变得更脆弱，而是在变得更诚实。',
    source: 'Soul Oasis',
    tags: ['情绪', '自我接纳'],
    mood: '舒缓',
  },
  {
    id: 'q2',
    text: '允许自己慢一点，是一种成熟的温柔。',
    source: 'Soul Oasis',
    tags: ['节奏', '自我关怀'],
    mood: '舒缓',
  },
  {
    id: 'q3',
    text: '情绪不是敌人，它只是来提醒你：你很重要。',
    source: 'Soul Oasis',
    tags: ['情绪', '觉察'],
    mood: '清醒',
  },
  {
    id: 'q4',
    text: '当你愿意照顾自己，世界也会对你柔软一点。',
    source: 'Soul Oasis',
    tags: ['自我关怀', '生活'],
    mood: '舒缓',
  },
  {
    id: 'q5',
    text: '把今天过好，就已经很厉害了。',
    source: 'Soul Oasis',
    tags: ['鼓励', '坚持'],
    mood: '鼓励',
  },
  {
    id: 'q6',
    text: '你可以害怕，但也可以继续。',
    source: 'Soul Oasis',
    tags: ['勇气', '行动'],
    mood: '鼓励',
  },
  {
    id: 'q7',
    text: '如果今天很难，就把目标改成：吃饭、喝水、睡觉。',
    source: 'Soul Oasis',
    tags: ['睡眠', '身体'],
    mood: '舒缓',
  },
  {
    id: 'q8',
    text: '当你开始照顾自己，你就在重建安全感。',
    source: 'Soul Oasis',
    tags: ['安全感', '自我关怀'],
    mood: '清醒',
  },
];

const ALL_TAG = '全部';

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function QuotesScreen({}: Props) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAG);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const tags = useMemo(() => {
    const t = uniq(QUOTES.flatMap((q) => q.tags));
    return [ALL_TAG, ...t];
  }, []);

  const filtered = useMemo(() => {
    if (selectedTag === ALL_TAG) return QUOTES;
    return QUOTES.filter((q) => q.tags.includes(selectedTag));
  }, [selectedTag]);

  const [index, setIndex] = useState(0);

  const safeIndex = filtered.length === 0 ? 0 : Math.min(index, filtered.length - 1);
  const quote = filtered[safeIndex] ?? filtered[0] ?? QUOTES[0];
  const isFavorite = favorites.includes(quote.id);

  const favoriteCountText = useMemo(() => {
    if (favorites.length === 0) return '暂未收藏';
    return `已收藏 ${favorites.length} 条`;
  }, [favorites.length]);

  const pickNext = () => {
    if (filtered.length === 0) return;
    setIndex((prev) => (prev + 1) % filtered.length);
  };

  const pickRandom = () => {
    if (filtered.length === 0) return;
    const next = Math.floor(Math.random() * filtered.length);
    setIndex(next);
  };

  const toggleFavorite = () => {
    setFavorites((prev) => {
      if (prev.includes(quote.id)) return prev.filter((x) => x !== quote.id);
      return [...prev, quote.id];
    });
  };

  const favoriteQuotes = useMemo(() => {
    const map = new Map(QUOTES.map((q) => [q.id, q] as const));
    return favorites.map((id) => map.get(id)).filter(Boolean) as Quote[];
  }, [favorites]);

  return (
    <Screen>
      <Card>
        <Text style={styles.sectionTitle}>筛选</Text>
        <Text style={styles.muted}>按标签快速定位更适合当下的语气与主题。</Text>
        <View style={styles.tagRow}>
          {tags.map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={t === selectedTag ? 'primary' : 'ghost'}
              onPress={() => {
                setSelectedTag(t);
                setIndex(0);
              }}
            />
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.quoteTopRow}>
          <Text style={styles.badge}>{quote.mood}</Text>
          <PrimaryButton
            title={showFavorites ? '查看当前' : '查看收藏'}
            variant="ghost"
            onPress={() => setShowFavorites((v) => !v)}
          />
        </View>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.quoteSource}>— {quote.source}</Text>
        <View style={styles.row}>
          <PrimaryButton title="换一条" onPress={pickNext} style={styles.flex} />
          <PrimaryButton title="随机" variant="ghost" onPress={pickRandom} style={styles.flex} />
          <PrimaryButton
            title={isFavorite ? '已收藏' : '收藏'}
            variant={isFavorite ? 'primary' : 'ghost'}
            onPress={toggleFavorite}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>收藏</Text>
        <Text style={styles.muted}>{favoriteCountText}</Text>
        {showFavorites && favoriteQuotes.length > 0 ? (
          <View style={styles.favList}>
            {favoriteQuotes.map((q) => (
              <View key={q.id} style={styles.favItem}>
                <Text style={styles.favText}>{q.text}</Text>
                <Text style={styles.favMeta}>{`${q.mood} · ${q.tags.join(' / ')}`}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quoteMark: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.primary,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  quoteSource: {
    marginTop: 10,
    fontSize: 13,
    color: colors.muted,
  },
  row: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  tagRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    color: colors.text,
    fontSize: 12,
    overflow: 'hidden',
  },
  quoteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  favList: {
    marginTop: 12,
    gap: 10,
  },
  favItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  favText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  favMeta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.muted,
  },
});
