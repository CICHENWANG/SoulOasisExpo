import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'StudyTheme'>;

type FocusBlock = {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
};

const INITIAL: FocusBlock[] = [
  { id: 'f1', title: 'Focus (25 minutes)', minutes: 25, done: false },
  { id: 'f2', title: 'Break (5 minutes)', minutes: 5, done: false },
  { id: 'f3', title: 'Review (2 minutes)', minutes: 2, done: false },
];

export function StudyThemeScreen({}: Props) {
  const [blocks, setBlocks] = useState<FocusBlock[]>(INITIAL);

  const doneCount = useMemo(() => blocks.filter((b) => b.done).length, [blocks]);

  const toggle = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Study</Text>
        <Text style={styles.subtitle}>Turn study pressure into doable steps. Starting small is enough.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Today's rhythm</Text>
        <Text style={styles.muted}>{`Completed ${doneCount} / ${blocks.length}`}</Text>
      </Card>

      {blocks.map((b) => (
        <Card key={b.id}>
          <Text style={styles.itemTitle}>{b.title}</Text>
          <Text style={styles.itemDetail}>{`Suggested time: ${b.minutes} min`}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={b.done ? 'Done' : 'Complete this block'}
              variant={b.done ? 'primary' : 'ghost'}
              onPress={() => toggle(b.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>Tip</Text>
        <Text style={styles.muted}>Not “I must be perfect” - but “I can start.”</Text>
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
