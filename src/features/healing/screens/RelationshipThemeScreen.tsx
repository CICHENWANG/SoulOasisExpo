import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'RelationshipTheme'>;

type ActionItem = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

const INITIAL: ActionItem[] = [
  {
    id: 'r1',
    title: 'State your needs clearly',
    detail: 'Start with "I need..." and avoid blaming language.',
    done: false,
  },
  {
    id: 'r2',
    title: 'Set boundaries',
    detail: "Boundaries aren't rejection - they protect the relationship.",
    done: false,
  },
  {
    id: 'r3',
    title: 'Leave space in the relationship',
    detail: 'Allow silence, and allow closeness to build slowly.',
    done: false,
  },
];

export function RelationshipThemeScreen({ navigation }: Props) {
  const [items, setItems] = useState<ActionItem[]>(INITIAL);

  const doneCount = useMemo(() => items.filter((x) => x.done).length, [items]);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Relationships</Text>
        <Text style={styles.subtitle}>In relationships, you deserve an important place too.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Today's practice</Text>
        <Text style={styles.muted}>{`Completed ${doneCount} / ${items.length}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="Breathing"
            variant="ghost"
            onPress={() => navigation.navigate('BreathingTraining')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Meditation"
            variant="ghost"
            onPress={() => navigation.navigate('MeditationGuide')}
            style={styles.flex}
          />
        </View>
      </Card>

      {items.map((x) => (
        <Card key={x.id}>
          <Text style={styles.itemTitle}>{x.title}</Text>
          <Text style={styles.itemDetail}>{x.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={x.done ? 'Tried' : 'Mark as tried'}
              variant={x.done ? 'primary' : 'ghost'}
              onPress={() => toggle(x.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>Reminder</Text>
        <Text style={styles.muted}>A good relationship helps you be more yourself - not more afraid of yourself.</Text>
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
