import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'SleepTheme'>;

type Habit = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

const INITIAL: Habit[] = [
  { id: 'h1', title: 'No screens for 30 minutes before bed', detail: 'Give your brain time to slow down.', done: false },
  { id: 'h2', title: 'Keep a consistent wake-up time', detail: 'It is often easier than forcing a fixed bedtime.', done: false },
  { id: 'h3', title: 'Warm water + gentle stretching', detail: 'Give your body a signal that it is safe to rest.', done: false },
];

export function SleepThemeScreen({}: Props) {
  const [habits, setHabits] = useState<Habit[]>(INITIAL);

  const doneCount = useMemo(() => habits.filter((h) => h.done).length, [habits]);

  const toggle = (id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Sleep</Text>
        <Text style={styles.subtitle}>Break sleep into doable micro-habits to reduce anxiety.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Today's habits</Text>
        <Text style={styles.muted}>{`Completed ${doneCount} / ${habits.length}`}</Text>
      </Card>

      {habits.map((h) => (
        <Card key={h.id}>
          <Text style={styles.itemTitle}>{h.title}</Text>
          <Text style={styles.itemDetail}>{h.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={h.done ? 'Done' : 'Mark done'}
              variant={h.done ? 'primary' : 'ghost'}
              onPress={() => toggle(h.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.muted}>
          Sleep is not about "falling asleep immediately" - it starts with helping your body return to a sense of safety.
        </Text>
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
    marginBottom: 6,
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  itemDetail: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
