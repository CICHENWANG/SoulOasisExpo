import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'HealingHub'>;

type Mood = 'Stable' | 'Tired' | 'Anxious';

type PlanItem = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

export function HealingHubScreen({ navigation }: Props) {
  const [mood, setMood] = useState<Mood>('Stable');
  const [plan, setPlan] = useState<PlanItem[]>([
    { id: 'h1', title: 'Breathing practice (1 round)', detail: 'Stabilize body signals', done: false },
    { id: 'h2', title: 'Meditation (3-5 minutes)', detail: 'Let go of looping thoughts', done: false },
    { id: 'h3', title: 'Pick a theme', detail: 'Sleep / Study / Relationships (choose 1)', done: false },
  ]);

  const doneCount = useMemo(() => plan.filter((x) => x.done).length, [plan]);

  const suggestion = useMemo(() => {
    if (mood === 'Tired') return 'Start with Sleep: shrink the goal to “fall asleep a bit easier tonight.”';
    if (mood === 'Anxious') return 'Do 2 minutes of breathing first, then decide whether to enter a theme.';
    return 'Start with one theme. Sticking with it for 7 days usually helps.';
  }, [mood]);

  const togglePlan = (id: string) => {
    setPlan((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Healing hub</Text>
        <Text style={styles.subtitle}>
          From themed plans to daily practice, helping you take care of your emotions in a more concrete way.
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Today's mood</Text>
        <Text style={styles.muted}>{`Current: ${mood}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="Stable"
            variant={mood === 'Stable' ? 'primary' : 'ghost'}
            onPress={() => setMood('Stable')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Tired"
            variant={mood === 'Tired' ? 'primary' : 'ghost'}
            onPress={() => setMood('Tired')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Anxious"
            variant={mood === 'Anxious' ? 'primary' : 'ghost'}
            onPress={() => setMood('Anxious')}
            style={styles.flex}
          />
        </View>
        <Text style={styles.muted}>{suggestion}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Themes</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="Sleep"
            onPress={() => navigation.navigate('SleepTheme')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Study"
            variant="ghost"
            onPress={() => navigation.navigate('StudyTheme')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton
          title="Relationships"
          variant="ghost"
          onPress={() => navigation.navigate('RelationshipTheme')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Quick practice</Text>
        <Text style={styles.muted}>
          These practices help you stabilize in 1-3 minutes. Later we can expand them with audio or animated guidance.
        </Text>
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

      <Card>
        <Text style={styles.sectionTitle}>Today's plan</Text>
        <Text style={styles.muted}>{`Completed ${doneCount} / ${plan.length}`}</Text>
        <View style={styles.planList}>
          {plan.map((x) => (
            <View key={x.id} style={styles.planItem}>
              <View style={styles.planText}>
                <Text style={styles.planTitle}>{x.title}</Text>
                <Text style={styles.planDetail}>{x.detail}</Text>
              </View>
              <PrimaryButton
                title={x.done ? 'Done' : 'Complete'}
                variant={x.done ? 'primary' : 'ghost'}
                onPress={() => togglePlan(x.id)}
              />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Suggestion</Text>
        <Text style={styles.muted}>
          Pick the theme you care about most and make small adjustments for 7 days. It's more sustainable than changing everything at once.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    paddingVertical: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
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
  muted: {
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
  planList: {
    marginTop: 12,
    gap: 10,
  },
  planItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  planText: {
    flex: 1,
    gap: 4,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  planDetail: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
});
