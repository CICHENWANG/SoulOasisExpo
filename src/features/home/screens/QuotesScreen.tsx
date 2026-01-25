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
  mood: 'Calm' | 'Encouraging' | 'Grounding';
};

const QUOTES: Quote[] = [
  {
    id: 'q1',
    text: "You're not becoming more fragile; you're becoming more honest.",
    source: 'Soul Oasis',
    tags: ['Emotion', 'Self-acceptance'],
    mood: 'Calm',
  },
  {
    id: 'q2',
    text: 'Allowing yourself to slow down is a mature kind of gentleness.',
    source: 'Soul Oasis',
    tags: ['Pace', 'Self-care'],
    mood: 'Calm',
  },
  {
    id: 'q3',
    text: "Emotions aren't the enemy; they're here to remind you that you matter.",
    source: 'Soul Oasis',
    tags: ['Emotion', 'Awareness'],
    mood: 'Grounding',
  },
  {
    id: 'q4',
    text: 'When you choose to care for yourself, the world can feel a little softer.',
    source: 'Soul Oasis',
    tags: ['Self-care', 'Life'],
    mood: 'Calm',
  },
  {
    id: 'q5',
    text: 'Getting through today is already an achievement.',
    source: 'Soul Oasis',
    tags: ['Encouragement', 'Perseverance'],
    mood: 'Encouraging',
  },
  {
    id: 'q6',
    text: 'You can be scared—and still keep going.',
    source: 'Soul Oasis',
    tags: ['Courage', 'Action'],
    mood: 'Encouraging',
  },
  {
    id: 'q7',
    text: 'If today is hard, change the goal to: eat, drink water, sleep.',
    source: 'Soul Oasis',
    tags: ['Sleep', 'Body'],
    mood: 'Calm',
  },
  {
    id: 'q8',
    text: "When you start caring for yourself, you're rebuilding a sense of safety.",
    source: 'Soul Oasis',
    tags: ['Safety', 'Self-care'],
    mood: 'Grounding',
  },
];

const ALL_TAG = 'All';

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
    if (favorites.length === 0) return 'No favorites yet';
    return `Saved ${favorites.length}`;
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
        <Text style={styles.sectionTitle}>Filter</Text>
        <Text style={styles.muted}>Filter by tag to find a tone and theme that fits right now.</Text>
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
            title={showFavorites ? 'View current' : 'View favorites'}
            variant="ghost"
            onPress={() => setShowFavorites((v) => !v)}
          />
        </View>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.quoteSource}>— {quote.source}</Text>
        <View style={styles.row}>
          <PrimaryButton title="Next" onPress={pickNext} style={styles.flex} />
          <PrimaryButton title="Random" variant="ghost" onPress={pickRandom} style={styles.flex} />
          <PrimaryButton
            title={isFavorite ? 'Saved' : 'Save'}
            variant={isFavorite ? 'primary' : 'ghost'}
            onPress={toggleFavorite}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Favorites</Text>
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
