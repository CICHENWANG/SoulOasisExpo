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
  text: string;
  source: string;
};

const QUOTES: Quote[] = [
  { text: '你不是在变得更脆弱，而是在变得更诚实。', source: 'Soul Oasis' },
  { text: '允许自己慢一点，是一种成熟的温柔。', source: 'Soul Oasis' },
  { text: '情绪不是敌人，它只是来提醒你：你很重要。', source: 'Soul Oasis' },
  { text: '当你愿意照顾自己，世界也会对你柔软一点。', source: 'Soul Oasis' },
  { text: '把今天过好，就已经很厉害了。', source: 'Soul Oasis' },
];

export function QuotesScreen({}: Props) {
  const [index, setIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  const quote = QUOTES[index] ?? QUOTES[0];
  const isFavorite = favorites.includes(index);

  const favoriteCountText = useMemo(() => {
    if (favorites.length === 0) return '暂未收藏';
    return `已收藏 ${favorites.length} 条`;
  }, [favorites.length]);

  const pickNext = () => {
    setIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const toggleFavorite = () => {
    setFavorites((prev) => {
      if (prev.includes(index)) return prev.filter((x) => x !== index);
      return [...prev, index];
    });
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.quoteSource}>— {quote.source}</Text>
        <View style={styles.row}>
          <PrimaryButton title="换一条" onPress={pickNext} style={styles.flex} />
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
});
