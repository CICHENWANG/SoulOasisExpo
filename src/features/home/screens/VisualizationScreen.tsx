import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Visualization'>;

type Metrics = {
  mood: number;
  stress: number;
  sleepHours: number;
};

type DailyRecord = Metrics & {
  id: string;
  dateLabel: string;
  note: string;
};

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function randomMetrics(): Metrics {
  const mood = Math.floor(60 + Math.random() * 35);
  const stress = Math.floor(20 + Math.random() * 60);
  const sleepHours = Math.round((5 + Math.random() * 4) * 10) / 10;
  return { mood, stress, sleepHours };
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function makeRecord(dateLabel: string, note: string): DailyRecord {
  const m = randomMetrics();
  return { id: id('rec'), dateLabel, note, ...m };
}

function getWeekSeed(): DailyRecord[] {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const notes = [
    'Slept okay',
    'A bit distracted',
    'Feeling good',
    'Stress feels higher',
    'Need more rest',
    'Talked with a friend',
    'Taking it slow',
  ];
  return labels.map((l, i) => makeRecord(l, notes[i] ?? 'Just a note')).slice(-7);
}

function Meter({ label, valueText, ratio }: { label: string; valueText: string; ratio: number }) {
  return (
    <View style={styles.meter}>
      <View style={styles.meterTop}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>{valueText}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(clamp01(ratio) * 100)}%` }]} />
      </View>
    </View>
  );
}

export function VisualizationScreen({}: Props) {
  const [records, setRecords] = useState<DailyRecord[]>(() => getWeekSeed());
  const latest = records[records.length - 1] ?? makeRecord('Today', '');
  const [note, setNote] = useState('');
  const [quickMood, setQuickMood] = useState<'Good' | 'Okay' | 'Down'>('Okay');

  const metrics = useMemo<Metrics>(
    () => ({ mood: latest.mood, stress: latest.stress, sleepHours: latest.sleepHours }),
    [latest.mood, latest.stress, latest.sleepHours],
  );

  const moodRatio = useMemo(() => metrics.mood / 100, [metrics.mood]);
  const sleepRatio = useMemo(() => metrics.sleepHours / 10, [metrics.sleepHours]);
  const stressRatio = useMemo(() => metrics.stress / 100, [metrics.stress]);

  const avgMood = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((acc, r) => acc + r.mood, 0) / records.length);
  }, [records]);

  const avgStress = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((acc, r) => acc + r.stress, 0) / records.length);
  }, [records]);

  const avgSleep = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round((records.reduce((acc, r) => acc + r.sleepHours, 0) / records.length) * 10) / 10;
  }, [records]);

  const addRecord = () => {
    const label = `Entry #${records.length + 1}`;
    const safeNote = stripCjk(note).trim() || `Feeling: ${quickMood}`;
    const next = makeRecord(label, safeNote);
    setRecords((prev) => [...prev.slice(-6), next]);
    setNote('');
  };

  const refreshLatest = () => {
    setRecords((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (!last) return [makeRecord('Today', 'Just a note')];
      next[next.length - 1] = { ...last, ...randomMetrics() };
      return next;
    });
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Visualization</Text>
        <Text style={styles.subtitle}>A local mock to demonstrate the record → stats → feedback loop.</Text>
      </Card>

      <Card>
        <Meter label="Mood" valueText={`${metrics.mood}/100`} ratio={moodRatio} />
        <Meter label="Stress" valueText={`${metrics.stress}/100`} ratio={stressRatio} />
        <Meter label="Sleep" valueText={`${metrics.sleepHours}h`} ratio={sleepRatio} />
        <View style={styles.row}>
          <PrimaryButton title="Refresh" variant="ghost" onPress={refreshLatest} style={styles.flex} />
          <PrimaryButton title="Add entry" onPress={addRecord} style={styles.flex} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Quick entry</Text>
        <Text style={styles.muted}>Capture your state with one small action. Later this can connect to backend storage.</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="Good"
            variant={quickMood === 'Good' ? 'primary' : 'ghost'}
            onPress={() => setQuickMood('Good')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Okay"
            variant={quickMood === 'Okay' ? 'primary' : 'ghost'}
            onPress={() => setQuickMood('Okay')}
            style={styles.flex}
          />
          <PrimaryButton
            title="Down"
            variant={quickMood === 'Down' ? 'primary' : 'ghost'}
            onPress={() => setQuickMood('Down')}
            style={styles.flex}
          />
        </View>
        <TextField
          label="Note"
          value={note}
          onChangeText={(t) => setNote(stripCjk(t))}
          placeholder="One sentence: what happened / what do I need? (optional)"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Weekly trend</Text>
        <Text style={styles.muted}>{`Avg mood ${avgMood} / 100 · Avg stress ${avgStress} / 100 · Avg sleep ${avgSleep}h`}</Text>
        <View style={styles.trendList}>
          {records.map((r) => (
            <View key={r.id} style={styles.trendItem}>
              <Text style={styles.trendLabel}>{r.dateLabel}</Text>
              <View style={styles.trendBars}>
                <View style={styles.trendBarBlock}>
                  <Text style={styles.trendMeta}>Mood</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.round(clamp01(r.mood / 100) * 100)}%` }]} />
                  </View>
                </View>
                <View style={styles.trendBarBlock}>
                  <Text style={styles.trendMeta}>Stress</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.round(clamp01(r.stress / 100) * 100)}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.muted}>
          This is a frontend mock: each entry generates a local data structure. Later it can be replaced with a backend API and database.
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
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  meter: {
    marginBottom: 12,
  },
  meterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  meterValue: {
    fontSize: 13,
    color: colors.muted,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  trendList: {
    marginTop: 12,
    gap: 12,
  },
  trendItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  trendLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  trendBars: {
    gap: 10,
  },
  trendBarBlock: {
    gap: 8,
  },
  trendMeta: {
    fontSize: 12,
    color: colors.muted,
  },
});
